import globals, bcrypt, bson, jwt
from bson import ObjectId
from flask import Blueprint, make_response, jsonify, request
from decorators import admin_required, tenant_required, landlord_required

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

@tenants_bp.route('/api/tenants', methods=['POST'])
@admin_required
def add_tenant():
    fields = ['name', 'username', 'password', 'email']
    if not all(field in request.form for field in fields):
        return make_response(jsonify({'error': 'Missing fields'}), 400)

    new_tenant = {
        'name': str(request.form['name']),
        'username': str(request.form['username']),
        'email': str(request.form['email']),
        'role': 'tenant',
        'password': bcrypt.hashpw(request.form['password'].encode("utf-8"), bcrypt.gensalt()),
        'property_id': None
    }
    newly_created_tenant = tenants.insert_one(new_tenant).inserted_id
    return make_response(jsonify({'_id': str(newly_created_tenant)}), 201)

@tenants_bp.route('/api/tenants/<tenant_id>', methods=['PUT'])
@tenant_required
def update_tenant(tenant_id):
    try:
        tenant_obj_id = ObjectId(tenant_id)
    except bson.errors.InvalidId:
        return make_response(jsonify({'error': 'Invalid tenant_id'}), 400)

    fields = ['name', 'username', 'email', 'password']
    updated_information = {}

    for field in fields:
        if field in request.form:
            if field in ['name', 'username', 'email']:
                try:
                    updated_information[field] = str(request.form[field])
                except (ValueError, TypeError):
                    return make_response(jsonify({'error': 'Invalid field'}), 400)
            elif field == 'password':
                updated_information['password'] = bcrypt.hashpw(request.form['password'].encode("utf-8"), bcrypt.gensalt())

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

    tenant = tenants.find_one({'_id': tenant_obj_id})
    if not tenant:
        return make_response(jsonify({'error': 'Tenant not found'}), 404)

    property_id = tenant.get('property_id')
    if property_id:
        properties.update_one({'_id': ObjectId(property_id)}, {'$set': {'tenant_id': None}})

    result = tenants.delete_one({'_id': tenant_obj_id})
    if result.deleted_count == 1:
        return make_response(jsonify({'message': 'Tenant deleted'}), 200)
    else:
        return make_response(jsonify({'error': 'Tenant not found'}), 404)