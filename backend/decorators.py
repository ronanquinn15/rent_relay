import jwt, globals
from flask import make_response, jsonify, request
from functools import wraps

blacklist = globals.db.blacklist

# This module contains decorators for JWT authentication and role-based access control.
# It uses the JWT library for encoding and decoding JWT tokens.
# The decorators are used to protect certain routes in the application, ensuring that only authorised
# users can access them.

def jwt_required(func):
    @wraps(func)
    def jwt_required_wrapper(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return make_response(jsonify({'error': 'Token is missing'}), 401)
        try:
            data = jwt.decode(token, globals.secret_key, algorithms='HS256')
        except:
            return make_response(jsonify({'error': 'Token is invalid'}), 401)

        bl_token = blacklist.find_one({'token': token})
        if bl_token is not None:
            return make_response(jsonify({'error': 'Token is invalid'}), 401)
        return func(*args, **kwargs)
    return jwt_required_wrapper

def admin_required(f):
    @wraps(f)
    def admin_required_wrapper(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return make_response(jsonify({'error': 'Token is missing'}), 401)
        try:
            data = jwt.decode(token, globals.secret_key, algorithms='HS256')
        except jwt.InvalidTokenError:
            return make_response(jsonify({'error': 'Token is invalid'}), 401)
        if data['role'] == 'admin':
            return f(*args, **kwargs)
        else:
            return make_response(jsonify({'error': 'Admin access required'}), 401)
    return admin_required_wrapper

def landlord_required(f):
    @wraps(f)
    def landlord_required_wrapper(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return make_response(jsonify({'error': 'Token is missing'}), 401)
        try:
            data = jwt.decode(token, globals.secret_key, algorithms='HS256')
        except jwt.InvalidTokenError:
            return make_response(jsonify({'error': 'Token is invalid'}), 401)
        if data['role'] == 'landlord':
            return f(*args, **kwargs)
        else:
            return make_response(jsonify({'error': 'Landlord access required'}), 401)
    return landlord_required_wrapper

def tenant_required(f):
    @wraps(f)
    def tenant_required_wrapper(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return make_response(jsonify({'error': 'Token is missing'}), 401)
        try:
            data = jwt.decode(token, globals.secret_key, algorithms='HS256')
        except jwt.InvalidTokenError:
            return make_response(jsonify({'error': 'Token is invalid'}), 401)
        if data['role'] == 'tenant':
            return f(*args, **kwargs)
        else:
            return make_response(jsonify({'error': 'Tenant access required'}), 401)
    return tenant_required_wrapper
