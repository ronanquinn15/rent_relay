import globals, bcrypt, bson, jwt
from bson import ObjectId
from flask import Blueprint, make_response, jsonify, request
from decorators import admin_required, tenant_required
from validation import validate_text, validate_email_address, validate_username_length, validate_password_length

tenants_bp = Blueprint('tenants', __name__)

tenants = globals.db.tenants
properties = globals.db.properties

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

@tenants_bp.route('/api/tenant/info', methods=['GET'])
@tenant_required
def get_tenant_info():
    tenant_id = auto_populate_tenant_id()
    if not tenant_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    tenant = tenants.find_one({'_id': tenant_id}, {'password': 0})
    if tenant:
        tenant['_id'] = str(tenant['_id'])
        tenant['property_id'] = str(tenant['property_id']) if tenant.get('property_id') else None
        return make_response(jsonify(tenant), 200)
    else:
        return make_response(jsonify({'error': 'Tenant not found'}), 404)

@tenants_bp.route('/api/tenant/<tenant_id>/property', methods=['GET'])
@tenant_required
def get_tenant_property(tenant_id):
    try:
        tenant_obj_id = ObjectId(tenant_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid tenant_id'}), 400)

    tenant = tenants.find_one({'_id': tenant_obj_id}, {'property_id': 1})
    if tenant and 'property_id' in tenant:
        return make_response(jsonify({'property_id': str(tenant['property_id'])}), 200)
    else:
        return make_response(jsonify({'error': 'Property ID not found for tenant'}), 404)

@tenants_bp.route('/api/tenants', methods=['GET'])
@admin_required
def get_all_tenants():
    tenants_list = []

    for tenant in tenants.find({}, {'password': 0}):
        tenant['_id'] = str(tenant['_id'])
        tenant['property_id'] = str(tenant['property_id'])
        tenants_list.append(tenant)
    return make_response(jsonify(tenants_list), 200)

@tenants_bp.route('/api/tenants/<tenant_id>', methods=['GET'])
@admin_required
def get_tenant(tenant_id):
    try:
        tenant_obj_id = ObjectId(tenant_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid tenant_id'}), 400)

    tenant = tenants.find_one({'_id': tenant_obj_id}, {'password': 0})

    if tenant is not None:
        tenant['_id'] = str(tenant['_id'])
        tenant['property_id'] = str(tenant['property_id'])
        return make_response(jsonify(tenant), 200)
    return make_response(jsonify({'error': 'Tenant not found'}), 404)

@tenants_bp.route('/api/tenants/<tenant_id>', methods=['PUT'])
@tenant_required
def update_tenant(tenant_id):
    try:
        tenant_obj_id = ObjectId(tenant_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid tenant_id'}), 400)

    # Ensure the tenant can only update their own information
    token_tenant_id = auto_populate_tenant_id()
    if not token_tenant_id or token_tenant_id != tenant_obj_id:
        return make_response(jsonify({'error': 'Unauthorized'}), 401)

    fields = ['name', 'username', 'email', 'password']
    updated_information = {}

    for field in fields:
        if field in request.form:
            value = request.form[field]
            if field == 'name':
                error = validate_text(value)
                if error:
                    return make_response(jsonify({'error': error}), 400)
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

    result = tenants.update_one({'_id': tenant_obj_id}, {'$set': updated_information})
    if result.modified_count == 1:
        return make_response(jsonify({'message': 'Tenant updated'}), 200)
    else:
        return make_response(jsonify({'error': 'Tenant not found'}), 404)

@tenants_bp.route('/api/tenants/<tenant_id>', methods=['DELETE'])
@admin_required
def delete_tenant(tenant_id):
    try:
        tenant_obj_id = ObjectId(tenant_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid tenant_id'}), 400)

    # Find tenant
    tenant = tenants.find_one({'_id': tenant_obj_id})
    if not tenant:
        return make_response(jsonify({'error': 'Tenant not found'}), 404)

    # Remove tenant from property
    property_id = tenant.get('property_id')
    if property_id:
        properties.update_one({'_id': ObjectId(property_id)}, {'$set': {'tenant_id': None}})

    result = tenants.delete_one({'_id': tenant_obj_id})
    if result.deleted_count == 1:
        return make_response(jsonify({'message': 'Tenant deleted'}), 200)
    else:
        return make_response(jsonify({'error': 'Tenant not found'}), 404)