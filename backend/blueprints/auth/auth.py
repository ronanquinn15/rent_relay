import datetime, jwt, bcrypt, globals
from flask import Blueprint, make_response, jsonify, request
from decorators import jwt_required, landlord_required

auth_bp = Blueprint('auth', __name__)

blacklist = globals.db.blacklist
tenants = globals.db.tenants
landlords = globals.db.landlords
admin = globals.db.admin

@auth_bp.route('/api/login', methods=['GET'])
def login():
    auth = request.authorization
    if auth:
        user = tenants.find_one({'username': auth.username}) or landlords.find_one({'username': auth.username}) or admin.find_one({'username': auth.username})
        if user is not None:
            if bcrypt.checkpw(bytes(auth.password, 'UTF-8'), user['password']):
                token = jwt.encode({
                    'user': user['username'],
                    'user_id': str(user['_id']),
                    'role': user['role'],
                    'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=90)
                }, globals.secret_key ,algorithm='HS256')
                return make_response(jsonify({'token': token, 'role': user['role']}), 200)
            else:
                return make_response(jsonify({'error': 'Password is incorrect'}), 401)
        else:
            return make_response(jsonify({'error': 'User not found'}), 404)
    return make_response(jsonify({'error': 'AUTHENTICATION REQUIRED'}), 401)

@auth_bp.route('/api/logout', methods=['GET'])
@jwt_required
def logout():
    token = request.headers['x-access-token']
    blacklist.insert_one({'token': token})
    return make_response(jsonify({'message': 'Logged out successfully'}), 200)