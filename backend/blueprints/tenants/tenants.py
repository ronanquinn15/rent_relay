import globals, jwt, bcrypt
from bson import ObjectId
from flask import Blueprint, make_response, jsonify, request
from decorators import landlord_required

from backend.decorators import admin_required

tenants_bp = Blueprint('tenants', __name__)

tenants = globals.db.tenants

@tenants_bp.route('/api/tenants', methods=['GET'])
@landlord_required
def get_all_tenants():
    tenants_list = []

    for tenant in tenants.find({}, {'password': 0}):
        tenant['_id'] = str(tenant['_id'])
        tenant['property_id'] = str(tenant['property_id'])
        tenants_list.append(tenant)
    return make_response(jsonify(tenants_list), 200)

@tenants_bp.route('/api/tenants/<tenant_id>', methods=['GET'])
@landlord_required
def get_tenant(tenant_id):
    tenant = tenants.find_one({'_id': ObjectId(tenant_id)}, {'password': 0})

    if tenant is not None:
        tenant['_id'] = str(tenant['_id'])
        tenant['property_id'] = str(tenant['property_id'])
        return make_response(jsonify(tenant), 200)
    return make_response(jsonify({'error': 'Tenant not found'}), 404)

@tenants_bp.route('/api/tenants/<tenant_id>', methods=['PUT'])
@tenant_required
def update_tenant(tenant_id):
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

    result = tenants.update_one({'_id': ObjectId(tenant_id)}, {'$set': updated_information})
    if result.modified_count == 1:
        return make_response(jsonify({'message': 'Tenant updated'}), 200)
    else:
        return make_response(jsonify({'error': 'Tenant not found'}), 404)


@tenants_bp.route('/api/tenants/<tenant_id>', methods=['DELETE'])
@admin_required
def delete_tenant(tenant_id):
    result = tenants.delete_one({'_id': ObjectId(tenant_id)})
    if result.deleted_count == 1:
        return make_response(jsonify({'message': 'Tenant deleted'}), 200)
    else:
        return make_response(jsonify({'error': 'Tenant not found'}), 404)


