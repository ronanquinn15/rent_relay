import globals, jwt, bson
from datetime import datetime
from bson import ObjectId
from flask import Blueprint, make_response, jsonify, request
from decorators import landlord_required, admin_required, tenant_required
from validation import validate_required_fields, validate_text, validate_email_address, validate_username_length, validate_password_length

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
                return ObjectId(data['user_id'])
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    return None

def auto_populate_tenant_id():
    token = request.headers.get('x-access-token')
    if token:
        try:
            data = jwt.decode(token, globals.secret_key, algorithms='HS256')
            if data['role'] == 'tenant':
                return ObjectId(data['user_id'])
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    return None

@properties_bp.route('/api/properties', methods=['GET'])
@landlord_required
def get_all_properties():
    landlord_id = auto_populate_landlord_id()
    if not landlord_id:
        return make_response(jsonify({'error': 'Unauthorised'}), 404)

    properties_list = []
    for prop in properties.find({'landlord_id': ObjectId(landlord_id)}):
        prop['_id'] = str(prop['_id'])
        prop['landlord_id'] = str(prop['landlord_id'])
        prop['tenant_id'] = str(prop['tenant_id'])
        properties_list.append(prop)

    if not properties_list:
        return make_response(jsonify({'message': 'No properties are registered for this landlord'}), 404)

    return make_response(jsonify(properties_list), 200)

@properties_bp.route('/api/properties/<property_id>', methods=['GET'])
@landlord_required
def get_one_property(property_id):
    landlord_id = auto_populate_landlord_id()
    if not landlord_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    try:
        property_obj_id = ObjectId(property_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid property_id'}), 400)

    property = properties.find_one({'_id': property_obj_id, 'landlord_id': ObjectId(landlord_id)})
    if not property:
        return make_response(jsonify({'error': 'Property not found or unauthorized access'}), 404)

    property['_id'] = str(property['_id'])
    property['landlord_id'] = str(property['landlord_id'])
    property['tenant_id'] = str(property['tenant_id'])

    return make_response(jsonify(property), 200)

@properties_bp.route('/api/tenant/property/details', methods=['GET'])
@tenant_required
def get_property_details_with_tenant():
    tenant_id = auto_populate_tenant_id()
    if not tenant_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    # Find the property associated with the tenant
    property = properties.find_one({'tenant_id': ObjectId(tenant_id)})
    if not property:
        return make_response(jsonify({'error': 'Property not found'}), 404)

    property['_id'] = str(property['_id'])
    property['landlord_id'] = str(property['landlord_id'])
    property['tenant_id'] = str(property['tenant_id'])

    # Fetch the landlord's contact details
    landlord = landlords.find_one({'_id': ObjectId(property['landlord_id'])}, {'name': 1, 'email': 1, 'username': 1})
    if not landlord:
        return make_response(jsonify({'error': 'Landlord not found'}), 404)

    property['landlord_details'] = {
        'name': landlord.get('name'),
        'email': landlord.get('email'),
        'username': landlord.get('username')
    }

    # Fetch the tenants details
    tenant = tenants.find_one({'_id': ObjectId(tenant_id)}, {'name': 1, 'email': 1, 'username': 1})
    if not tenant:
        return make_response(jsonify({'error': 'Tenant not found'}), 404)

    property['tenant_details'] = {
        'name': tenant.get('name'),
        'email': tenant.get('email'),
        'username': tenant.get('username')
    }
    return make_response(jsonify(property), 200)

@properties_bp.route('/api/tenants/property', methods=['GET'])
@landlord_required
def get_tenants_on_each_prop():
    landlord_id = auto_populate_landlord_id()
    if not landlord_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    properties_list = []

    for property in properties.find({'landlord_id': ObjectId(landlord_id)}):
        property['_id'] = str(property['_id'])
        property['landlord_id'] = str(property['landlord_id'])
        property['tenant_id'] = str(property['tenant_id'])

        tenant_details = []
        if property['tenant_id']:
            tenant = tenants.find_one({'_id': ObjectId(property['tenant_id'])}, {'password': 0, '_id': 0, 'property_id': 0})
            if tenant:
                tenant_details.append(tenant)
        property['tenant_details'] = tenant_details
        properties_list.append(property)

    return make_response(jsonify(properties_list), 200)

@properties_bp.route('/api/tenants/property/<property_id>', methods=['GET'])
@landlord_required
def get_one_prop_with_tenants(property_id):
    landlord_id = auto_populate_landlord_id()
    if not landlord_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    try:
        property_obj_id = ObjectId(property_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid property_id'}), 400)

    property = properties.find_one({'_id': property_obj_id, 'landlord_id': ObjectId(landlord_id)})
    if not property:
        return make_response(jsonify({'error': 'Property not found or unauthorized access'}), 404)

    property['_id'] = str(property['_id'])
    property['landlord_id'] = str(property['landlord_id'])
    property['tenant_id'] = str(property['tenant_id'])

    tenant_details = []
    if property['tenant_id']:
        tenant = tenants.find_one({'_id': ObjectId(property['tenant_id'])}, {'password': 0, '_id': 0, 'property_id': 0})
        if tenant:
            tenant_details.append(tenant)
    property['tenant_details'] = tenant_details

    return make_response(jsonify(property), 200)

@properties_bp.route('/api/properties/<property_id>', methods=['PUT'])
@landlord_required
def update_property(property_id):
    landlord_id = auto_populate_landlord_id()
    if not landlord_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    try:
        property_obj_id = ObjectId(property_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid property_id'}), 400)

    property = properties.find_one({'_id': property_obj_id, 'landlord_id': ObjectId(landlord_id)})
    if not property:
        return make_response(jsonify({'error': 'Property not found or unauthorized access'}), 404)

    update_fields = ['address', 'postcode', 'city', 'number_of_bedrooms', 'number_of_bathrooms', 'rent', 'purchase_date', 'number_of_tenants']
    updated_information = {}

    for field in update_fields:
        if field in request.form:
            value = request.form[field]
            if field == 'purchase_date':
                try:
                    # Validate and reformat the purchase_date
                    purchase_date = datetime.strptime(value, '%Y/%m/%d')
                    updated_information[field] = purchase_date.strftime('%Y/%m/%d')
                except ValueError:
                    return make_response(jsonify({'error': 'Invalid date format, should be yyyy/mm/dd'}), 400)
            else:
                updated_information[field] = value

    if 'tenant_id' in request.form:
        tenant_id = request.form['tenant_id']
        if tenant_id != str(property.get('tenant_id')):  # Check if tenant_id is different
            try:
                tenant_obj_id = ObjectId(tenant_id)
            except bson.errors.InvalidId:
                return make_response(jsonify({'error': 'Invalid tenant_id'}), 400)

            tenant = tenants.find_one({'_id': tenant_obj_id})
            if not tenant:
                return make_response(jsonify({'error': 'Tenant not found'}), 404)
            if tenant.get('property_id'):
                return make_response(jsonify({'error': 'Tenant already assigned to a property'}), 400)

            # Set the old tenant's property_id to None
            if property.get('tenant_id'):
                old_tenant_id = property['tenant_id']
                tenants.update_one({'_id': old_tenant_id}, {'$set': {'property_id': None}})

            updated_information['tenant_id'] = tenant_obj_id

    if updated_information:
        result = properties.update_one({'_id': property_obj_id}, {'$set': updated_information})
        if result.modified_count == 1:
            if 'tenant_id' in updated_information:
                tenants.update_one({'_id': updated_information['tenant_id']}, {'$set': {'property_id': property_obj_id}})
            return make_response(jsonify({'message': 'Property updated successfully'}), 200)
        else:
            return make_response(jsonify({'error': 'Property not found or no changes made'}), 404)
    else:
        return make_response(jsonify({'error': 'No fields to update'}), 400)

@properties_bp.route('/api/properties/<property_id>/update_landlord', methods=['PUT'])
@admin_required
def update_property_landlord(property_id):
    if 'landlord_id' not in request.form:
        return make_response(jsonify({'error': 'Missing landlord_id'}), 400)

    new_landlord_id = request.form['landlord_id']
    try:
        new_landlord_obj_id = ObjectId(new_landlord_id)
        property_obj_id = ObjectId(property_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid ID format'}), 400)

    landlord = landlords.find_one({'_id': new_landlord_obj_id})
    if not landlord:
        return make_response(jsonify({'error': 'Landlord not found'}), 404)

    result = properties.update_one({'_id': property_obj_id}, {'$set': {'landlord_id': new_landlord_obj_id}})
    if result.modified_count == 1:
        return make_response(jsonify({'message': 'Property landlord updated'}), 200)
    else:
        return make_response(jsonify({'error': 'Property not found'}), 404)

@properties_bp.route('/api/properties/add', methods=['POST'])
@landlord_required
def add_property():
    fields = ['address', 'postcode', 'city', 'number_of_bedrooms', 'number_of_bathrooms', 'rent', 'purchase_date',
              'tenant_id']

    # Validate required fields
    error = validate_required_fields(request.form, fields)
    if error:
        return make_response(jsonify({"error": error}), 400)

    landlord_id = auto_populate_landlord_id()
    if not landlord_id:
        return make_response(jsonify({'error': 'Landlord not found'}), 404)

    tenant_id = request.form['tenant_id']
    try:
        tenant_obj_id = ObjectId(tenant_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid tenant_id'}), 400)

    tenant = tenants.find_one({'_id': tenant_obj_id})
    if not tenant:
        return make_response(jsonify({'error': 'Tenant not found'}), 404)
    if tenant['property_id']:
        return make_response(jsonify({'error': 'Tenant already assigned to a property'}), 400)

    try:
        purchase_date = datetime.strptime(request.form['purchase_date'], '%Y-%m-%d').strftime('%Y/%m/%d')
    except ValueError:
        return make_response(jsonify({'error': 'Invalid date format, should be yyyy-mm-dd'}), 400)

    new_property = {
        'address': str(request.form['address']),
        'postcode': str(request.form['postcode']),
        'city': str(request.form['city']),
        'number_of_bedrooms': int(request.form['number_of_bedrooms']),
        'number_of_bathrooms': int(request.form['number_of_bathrooms']),
        'rent': int(request.form['rent']),
        'purchase_date': purchase_date,
        'landlord_id': landlord_id,
        'number_of_tenants': 1,  # Set number_of_tenants to 1
        'tenant_id': tenant_obj_id
    }
    new_property_id = properties.insert_one(new_property).inserted_id

    # Update tenant with property_id
    tenants.update_one({'_id': tenant_obj_id}, {'$set': {'property_id': new_property_id}})

    return make_response(jsonify({'message': 'Property added', 'property_id': str(new_property_id)}), 201)

@properties_bp.route('/api/properties/<property_id>', methods=['DELETE'])
@landlord_required
def delete_property(property_id):
    landlord_id = auto_populate_landlord_id()
    if not landlord_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    try:
        property_obj_id = ObjectId(property_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid property_id'}), 400)

    property = properties.find_one({'_id': property_obj_id, 'landlord_id': landlord_id})
    if not property:
        return make_response(jsonify({'error': 'Property not found or unauthorized access'}), 404)

    # Update tenant with property_id to None
    tenant_id = property.get('tenant_id')
    if tenant_id:
        tenants.update_one({'_id': ObjectId(tenant_id)}, {'$set': {'property_id': None}})

    result = properties.delete_one({'_id': property_obj_id})
    if result.deleted_count == 1:
        return make_response(jsonify({'message': 'Property deleted'}), 200)
    return make_response(jsonify({'error': 'Property not found'}), 404)