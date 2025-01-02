import globals, jwt
from bson import ObjectId
from flask import Blueprint, make_response, jsonify, request
from decorators import landlord_required

properties_bp = Blueprint('properties', __name__)

properties = globals.db.properties
tenants = globals.db.tenants
landlords = globals.db.landlords

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

@properties_bp.route('/api/properties', methods=['GET'])
@landlord_required
def get_all_properties():
    properties_list = []

    for prop in properties.find():
        prop['_id'] = str(prop['_id'])
        prop['landlord_id'] = str(prop['landlord_id'])
        prop['tenant_id'] = str(prop['tenant_id'])
        properties_list.append(prop)
    return make_response(jsonify(properties_list), 200)

@properties_bp.route('/api/properties/<property_id>', methods=['GET'])
@landlord_required
def get_property(property_id):
    property = properties.find_one({'_id': ObjectId(property_id)})
    if property is not None:
        property['_id'] = str(property['_id'])
        property['landlord_id'] = str(property['landlord_id'])
        property['tenant_id'] = str(property['tenant_id'])
        return make_response(jsonify(property), 200)
    return make_response(jsonify({'error': 'Property not found'}), 404)

@properties_bp.route('/api/properties/<property_id>', methods=['PUT'])
@landlord_required
def update_property(property_id):
    fields = ['number_of_bedrooms', 'number_of_bathrooms', 'rent', 'purchase_date']
    updated_information = {}
    if not any(field in request.form for field in fields):
        return make_response(jsonify({'error': 'No fields to update'}), 400)

    for field in fields:
        if field in request.form:
            if field in ['number_of_bedrooms', 'number_of_bathrooms', 'rent', 'purchase_date']:
                try:
                    updated_information[f'{field}'] = int(request.form[field])
                except ValueError:
                    return make_response(jsonify({'error': 'Invalid value'}), 400)
            else:
                updated_information[f'{field}'] = request.form[field]

    if updated_information:
        result = properties.update_one({'_id': ObjectId(property_id)}, {'$set': updated_information})
        if result.modified_count == 1:
            return make_response(jsonify({'message': 'Property updated'}), 200)
        else:
            return make_response(jsonify({'error': 'Property not found'}), 404)
    else:
        return make_response(jsonify({'error': 'Missing fields'}), 400)

@properties_bp.route('/api/properties', methods=['POST'])
@landlord_required
def add_property():
    fields = ['address', 'postcode', 'city', 'number_of_bedrooms', 'number_of_bathrooms', 'rent', 'purchase_date',
              'number_of_tenants', 'tenant_id']
    if not all(field in request.form for field in fields):
        return make_response(jsonify({"error": "Missing form data."}), 400)

    landlord_id = auto_populate_landlord_id()
    if not landlord_id:
        return make_response(jsonify({'error': 'Landlord not found'}), 404)

    new_property = {
        'address': str(request.form['address']),
        'postcode': str(request.form['postcode']),
        'city': str(request.form['city']),
        'number_of_bedrooms': int(request.form['number_of_bedrooms']),
        'number_of_bathrooms': int(request.form['number_of_bathrooms']),
        'rent': int(request.form['rent']),
        'purchase_date': int(request.form['purchase_date']),
        'landlord_id': landlord_id,
        'number_of_tenants': int(request.form['number_of_tenants']),
        'tenant_id': ObjectId(request.form['tenant_id']) if 'tenant_id' in request.form and tenants.find_one({'_id': ObjectId(request.form['tenant_id'])}) else None
    }
    new_property_id = properties.insert_one(new_property)
    return make_response(jsonify({'message': 'Property added', 'property_id': str(new_property_id.inserted_id)}), 201)

@properties_bp.route('/api/properties/<property_id>', methods=['DELETE'])
@landlord_required
def delete_property(property_id):
    result = properties.delete_one({'_id': ObjectId(property_id)})
    if result.deleted_count == 1:
        return make_response(jsonify({'message': 'Property deleted'}), 200)
    return make_response(jsonify({'error': 'Property not found'}), 404)
