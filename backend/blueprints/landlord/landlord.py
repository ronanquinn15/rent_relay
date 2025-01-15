import bcrypt, globals, jwt, bson
from bson import ObjectId
from flask import Blueprint, make_response, jsonify, request
from decorators import landlord_required, admin_required
from validation import validate_email_address, validate_username_length, validate_password_length

landlord_bp = Blueprint('landlord', __name__)

landlords = globals.db.landlords
properties = globals.db.properties

def auto_populate_landlord_id():
    token = request.headers.get('x-access-token')
    if token:
        try:
            data = jwt.decode(token, globals.secret_key, algorithms='HS256')
            if data['role'] == 'landlord':
                return data['user_id']
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    return None

@landlord_bp.route('/api/landlords/details', methods=['GET'])
@landlord_required
def get_landlord_details():
    landlord_id = auto_populate_landlord_id()
    if not landlord_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    landlord = landlords.find_one({'_id': ObjectId(landlord_id)}, {'password': 0})
    if landlord:
        landlord['_id'] = str(landlord['_id'])
        return make_response(jsonify(landlord), 200)
    else:
        return make_response(jsonify({'error': 'Landlord not found'}), 404)

@landlord_bp.route('/api/landlords', methods=['GET'])
@admin_required
def get_all_landlords():
    landlords_list = []
    for landlord in landlords.find({}, {'password': 0}):
        landlord['_id'] = str(landlord['_id'])
        landlords_list.append(landlord)
    return make_response(jsonify(landlords_list), 200)

@landlord_bp.route('/api/landlords/<landlord_id>', methods=['PUT'])
@landlord_required
def edit_landlord(landlord_id):
    try:
        landlord_obj_id = ObjectId(landlord_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid landlord_id'}), 400)

    # Ensure the landlord can only update their own information
    token_landlord_id = auto_populate_landlord_id()
    if not token_landlord_id or token_landlord_id != landlord_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    fields = ['name', 'username', 'email', 'password']
    updated_information = {}

    for field in fields:
        if field in request.form:
            value = request.form[field]
            if field == 'name':
                if not value.strip():
                    return make_response(jsonify({'error': 'Name cannot be empty'}), 400)
                updated_information['name'] = value
            elif field == 'username':
                error = validate_username_length(value)
                if error:
                    return make_response(jsonify({'error': error}), 400)
                updated_information['username'] = value
            elif field == 'email':
                error = validate_email_address(value)
                if error:
                    return make_response(jsonify({'error': error}), 400)
                updated_information['email'] = value
            elif field == 'password':
                error = validate_password_length(value)
                if error:
                    return make_response(jsonify({'error': error}), 400)
                updated_information['password'] = bcrypt.hashpw(value.encode("utf-8"), bcrypt.gensalt())

    if not updated_information:
        return make_response(jsonify({'error': 'No fields to update'}), 400)

    result = landlords.update_one({'_id': landlord_obj_id}, {'$set': updated_information})
    if result.modified_count == 1:
        return make_response(jsonify({'message': 'Landlord updated'}), 200)
    else:
        return make_response(jsonify({'error': 'Landlord not found'}), 404)

@landlord_bp.route('/api/landlords/<landlord_id>', methods=['DELETE'])
@admin_required
def delete_landlord(landlord_id):
    try:
        landlord_obj_id = ObjectId(landlord_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid landlord_id'}), 400)

    result = landlords.delete_one({'_id': landlord_obj_id})
    if result.deleted_count == 1:
        properties.update_many({'landlord_id': landlord_obj_id}, {'$set': {'landlord_id': None}})
        return make_response(jsonify({'message': 'Landlord deleted'}), 200)
    else:
        return make_response(jsonify({'error': 'Landlord not found'}), 404)
