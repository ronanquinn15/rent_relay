import bcrypt, globals
from bson import ObjectId
from flask import Blueprint, make_response, jsonify, request
from decorators import jwt_required, landlord_required, admin_required,tenant_required

landlord_bp = Blueprint('landlord', __name__)

landlords = globals.db.landlords

@landlord_bp.route('/api/landlords', methods=['GET'])
def get_all_landlords():
    landlords_list = []
    for landlord in landlords.find({}, {'password': 0}):
        landlord['_id'] = str(landlord['_id'])
        landlords_list.append(landlord)
    return make_response(jsonify(landlords_list), 200)

@landlord_bp.route('/api/landlords' , methods=['POST'])
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
def edit_landlord(landlord_id):
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

    result = landlords.update_one({'_id': ObjectId(landlord_id)}, {'$set': update_fields})
    if result.modified_count == 1:
        return make_response(jsonify({'message': 'Landlord updated'}), 200)
    else:
        return make_response(jsonify({'error': 'Landlord not found'}), 404)



@landlord_bp.route('/api/landlords/<landlord_id>', methods=['DELETE'])
def delete_landlord(landlord_id):
    result = landlords.delete_one({'_id': ObjectId(landlord_id)})
    if result.deleted_count == 1:
        return make_response(jsonify({'message': 'Landlord deleted'}), 200)
    else:
        return make_response(jsonify({'error': 'Landlord not found'}), 404)
