import jwt, globals
from flask import make_response, jsonify, request
from functools import wraps

blacklist = globals.db.blacklist

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
        token = request.headers['x-access-token']
        data = jwt.decode(token, globals.secret_key, algorithms='HS256')
        if data['admin']:
            return f(*args, **kwargs)
        else:
            return make_response(jsonify({'error': 'Admin access required'}), 401)
    return admin_required_wrapper
