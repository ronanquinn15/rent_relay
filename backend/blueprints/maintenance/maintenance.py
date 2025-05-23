import globals, jwt, datetime, bson
from bson import ObjectId
from flask import Blueprint, make_response, jsonify, request
from decorators import landlord_required, tenant_required
from validation import validate_required_fields, validate_text

maintenance_bp = Blueprint('maintenance', __name__)

maintenance = globals.db.maintenance
properties = globals.db.properties
tenants = globals.db.tenants

# This function is used to auto-populate the tenant_id from the JWT token.
# It checks if the token is valid and extracts the tenant_id from it.
# If the token is invalid or expired, it returns None.
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

# This function is used to validate the required fields in the request.
# It checks if the required fields are present in the request form data.
def auto_populate_property_id():
    tenant_id = auto_populate_tenant_id()
    if tenant_id:
        tenant = tenants.find_one({'_id': ObjectId(tenant_id)}, {'property_id': 1})
        if tenant and 'property_id' in tenant:
            return tenant['property_id']
    return None

# This function allows tenants to create a maintenance request.
# It checks if the tenant is authorized and if the required fields are present in the request.
@maintenance_bp.route('/api/maintenance/submit', methods=['POST'])
@tenant_required
def create_maintenance_request():
    # Define required fields and allowed urgency values
    # The required fields are 'description' and 'urgency'.
    fields = ['description', 'urgency']
    allowed_urgent_values = ['low', 'medium', 'high']

    # Validate required fields
    error = validate_required_fields(request.form, fields)
    if error:
        return make_response(jsonify({'error': error}), 400)

    tenant_id = auto_populate_tenant_id()
    if not tenant_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    property_id = auto_populate_property_id()
    if not property_id:
        return make_response(jsonify({'error': 'Tenant does not have a property assigned'}), 400)

    urgency = request.form.get('urgency', 'low')
    if urgency not in allowed_urgent_values:
        return make_response(jsonify({'error': 'Invalid urgency value'}), 400)

    # Validate description
    description = request.form['description']
    error = validate_text(description)
    if error:
        return make_response(jsonify({'error': error}), 400)

    # Create a new maintenance request
    # The request is created with the property_id, tenant_id, description, urgency, request_date, and status.
    # The request_date is set to the current date and the status is set to False (not completed).
    new_request = {
        'property_id': property_id,
        'tenant_id': tenant_id,
        'description': description,
        'urgency': urgency,
        'request_date': datetime.datetime.now().strftime('%d-%m-%Y'),
        'status': False,
    }
    new_request_id = maintenance.insert_one(new_request).inserted_id
    return make_response(jsonify({'message': 'Maintenance request created', 'request_id': str(new_request_id)}), 201)

@maintenance_bp.route('/api/maintenance', methods=['GET'])
@landlord_required
def get_all_maintenance_requests():
    # Get landlord_id from the JWT token
    landlord_id = auto_populate_landlord_id()
    if not landlord_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    # Get all properties owned by landlord
    properties_list = properties.find({'landlord_id': landlord_id}, {'_id': 1, 'address': 1, 'city': 1, 'postcode': 1})
    property_ids = [prop['_id'] for prop in properties_list]

    if not property_ids:
        return make_response(jsonify({'error': 'No properties found for this landlord'}), 404)

    # Get all maintenance requests for properties owned by landlord
    requests = maintenance.find({'property_id': {'$in': property_ids}, 'status': False})
    requests_list = []
    for request in requests:
        request['_id'] = str(request['_id'])
        request['property_id'] = str(request['property_id'])
        request['tenant_id'] = str(request['tenant_id'])

        # Get tenant details
        tenant = tenants.find_one({'_id': ObjectId(request['tenant_id'])}, {'name': 1, 'email': 1})
        if tenant:
            request['tenant_details'] = {
                'name': tenant.get('name'),
                'email': tenant.get('email')
            }

        # Get property details
        property = properties.find_one({'_id': ObjectId(request['property_id'])}, {'address': 1, 'city': 1, 'postcode': 1})
        if property:
            request['property_details'] = {
                'address': property.get('address'),
                'city': property.get('city'),
                'postcode': property.get('postcode')
            }

        requests_list.append(request)

    if not requests_list:
        return make_response(jsonify({'error': 'No maintenance requests found for this landlord'}), 404)

    return make_response(jsonify(requests_list), 200)

# This function allows tenants to view all their maintenance requests.
# It checks if the tenant is authorized and retrieves all requests associated with the tenant_id.
@maintenance_bp.route('/api/maintenance/submitted', methods=['GET'])
@tenant_required
def get_all_requests_based_off_tenant():
    tenant_id = auto_populate_tenant_id()
    if not tenant_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    requests = maintenance.find({'tenant_id': ObjectId(tenant_id)})
    requests_list = []
    for request in requests:
        request['_id'] = str(request['_id'])
        request['property_id'] = str(request['property_id'])
        request['tenant_id'] = str(request['tenant_id'])

        # Get property details
        property = properties.find_one({'_id': ObjectId(request['property_id'])}, {'address': 1, 'city': 1, 'postcode': 1})
        if property:
            request['property_details'] = {
                'address': property.get('address'),
                'city': property.get('city'),
                'postcode': property.get('postcode')
            }

        requests_list.append(request)

    if not requests_list:
        return make_response(jsonify({'error': 'No maintenance requests found for this tenant'}), 404)
    return make_response(jsonify(requests_list), 200)

# This function allows landlords to view the details of a specific maintenance request.
# It checks if the landlord is authorised and retrieves the request based on the request_id.
# It also retrieves the tenant and property details associated with the request.
@maintenance_bp.route('/api/maintenance/details/<request_id>', methods=['GET'])
@landlord_required
def get_maintenance_request_with_details(request_id):
    landlord_id = auto_populate_landlord_id()
    if not landlord_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    try:
        request_obj_id = ObjectId(request_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid request_id'}), 400)

    # Get all properties owned by landlord
    properties_list = properties.find({'landlord_id': ObjectId(landlord_id)}, {'_id': 1})
    property_ids = [prop['_id'] for prop in properties_list]

    if not property_ids:
        return make_response(jsonify({'error': 'No properties found for this landlord'}), 404)

    request = maintenance.find_one({'_id': request_obj_id, 'property_id': {'$in': property_ids}})
    if request:
        request['_id'] = str(request['_id'])
        request['property_id'] = str(request['property_id'])
        request['tenant_id'] = str(request['tenant_id'])

        # Get tenant details
        tenant = tenants.find_one({'_id': ObjectId(request['tenant_id'])}, {'name': 1, 'email': 1, 'username': 1})
        if tenant:
            request['tenant_details'] = {
                'name': tenant.get('name'),
                'email': tenant.get('email'),
                'username': tenant.get('username')
            }

        # Get property details
        property = properties.find_one({'_id': ObjectId(request['property_id'])}, {'address': 1, 'city': 1, 'postcode': 1})
        if property:
            request['property_details'] = {
                'address': property.get('address'),
                'city': property.get('city'),
                'postcode': property.get('postcode')
            }

        return make_response(jsonify(request), 200)
    else:
        return make_response(jsonify({'error': 'Maintenance request not found'}), 404)


@maintenance_bp.route('/api/maintenance/submitted/<request_id>', methods=['GET'])
@tenant_required
def get_maintenance_request_tenant(request_id):
    tenant_id = auto_populate_tenant_id()
    if not tenant_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    try:
        request_obj_id = ObjectId(request_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid request_id'}), 400)

    request = maintenance.find_one({'_id': request_obj_id, 'tenant_id': tenant_id})
    if request:
        request['_id'] = str(request['_id'])
        request['property_id'] = str(request['property_id'])
        request['tenant_id'] = str(request['tenant_id'])

        # Get property details
        property = properties.find_one({'_id': ObjectId(request['property_id'])}, {'address': 1, 'city': 1, 'postcode': 1, 'landlord_id': 1})
        if property:
            request['property_details'] = {
                'address': property.get('address'),
                'city': property.get('city'),
                'postcode': property.get('postcode')
            }

        return make_response(jsonify(request), 200)
    else:
        return make_response(jsonify({'error': 'Maintenance request not found'}), 404)

@maintenance_bp.route('/api/maintenance/<request_id>', methods=['PUT'])
@landlord_required
def update_maintenance_request(request_id):
    try:
        request_obj_id = ObjectId(request_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid request_id'}), 400)

    fields = ['status']
    updated_information = {}
    if not any(field in request.form for field in fields):
        return make_response(jsonify({'error': 'No fields to update'}), 400)

    for field in fields:
        if field in request.form:
            if field == 'status':
                if request.form[field] == 'true':
                    updated_information[f'{field}'] = True
                elif request.form[field] == 'false':
                    updated_information[f'{field}'] = False
                else:
                    return make_response(jsonify({'error': 'Invalid value'}), 400)

    if updated_information:
        result = maintenance.update_one({'_id': request_obj_id}, {'$set': updated_information})
        if result.modified_count == 1:
            return make_response(jsonify({'message': 'Maintenance request updated'}), 200)
        else:
            return make_response(jsonify({'error': 'Maintenance request not found'}), 404)
    else:
        return make_response(jsonify({'error': 'Missing fields'}), 400)

# This function allows landlords to delete a maintenance request.
# It checks if the landlord is authorized and deletes the request based on the request_id.
# It also checks if the request_id is valid and if the request exists.
@maintenance_bp.route('/api/maintenance/<request_id>', methods=['DELETE'])
@tenant_required
def delete_maintenance_request(request_id):
    tenant_id = auto_populate_tenant_id()
    if not tenant_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    try:
        request_obj_id = ObjectId(request_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid request_id'}), 400)

    result = maintenance.delete_one({'_id': request_obj_id, 'tenant_id': tenant_id})
    if result.deleted_count == 1:
        return make_response(jsonify({'message': 'Maintenance request deleted'}), 200)
    else:
        return make_response(jsonify({'error': 'Maintenance request not found'}), 404)

