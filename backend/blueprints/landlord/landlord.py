import bcrypt, globals, jwt, bson
from bson import ObjectId
from flask import Blueprint, make_response, jsonify, request
from decorators import landlord_required, admin_required

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

@landlord_bp.route('/api/landlords', methods=['GET'])
@admin_required
def get_all_landlords():
    landlords_list = []
    for landlord in landlords.find({}, {'password': 0}):
        landlord['_id'] = str(landlord['_id'])
        landlords_list.append(landlord)
    return make_response(jsonify(landlords_list), 200)

@landlord_bp.route('/api/landlords' , methods=['POST'])
@admin_required
def add_landlord():
    fields = ['name', 'username', 'password', 'email']
    if not all(field in request.form for field in fields):
        return make_response(jsonify({'error': 'Missing fields'}), 400)

    new_landlord = {
        'name': str(request.form['name']),
        'username': str(request.form['username']),
        'email': str(request.form['email']),
        'role': 'landlord',
        'password': bcrypt.hashpw(request.form['password'].encode("utf-8"), bcrypt.gensalt()),
    }
    newly_created_landlord = landlords.insert_one(new_landlord).inserted_id,
    return make_response(jsonify({'_id': str(newly_created_landlord)}), 201)

@landlord_bp.route('/api/landlords/<landlord_id>', methods=['PUT'])
@landlord_required
def edit_landlord(landlord_id):
    try:
        landlord_obj_id = ObjectId(landlord_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid landlord_id'}), 400)

    token_landlord_id = auto_populate_landlord_id()
    if not token_landlord_id or token_landlord_id != landlord_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    fields = ['name', 'username', 'email', 'password']
    update_fields = {}

    for field in fields:
        if field in request.form:
            if field in ['name', 'username', 'email']:
                try:
                    update_fields[field] = str(request.form[field])
                except (ValueError, TypeError):
                    return make_response(jsonify({'error': 'Invalid field'}), 400)
            elif field == 'password':
                update_fields['password'] = bcrypt.hashpw(request.form['password'].encode("utf-8"), bcrypt.gensalt())

    if not update_fields:
        return make_response(jsonify({'error': 'No fields to update'}), 400)

    result = landlords.update_one({'_id': landlord_obj_id}, {'$set': update_fields})
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
