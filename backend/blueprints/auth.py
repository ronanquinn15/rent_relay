import datetime, jwt, bcrypt
from flask import Blueprint, make_response, jsonify, request
from pymongo import MongoClient

auth_bp = Blueprint('auth', __name__)

client = MongoClient('mongodb://localhost:27017/')
db = client.rentRelayDB

blacklist = db.blacklist
tenants = db.tenants
landlords = db.landlords
admin = db.admin
secret_key = 'secret_key'

@auth_bp.route('/api/login', methods=['GET'])
def login():
    auth = request.authorization
    if auth:
        user = tenants.find_one({'username': auth.username}) or landlords.find_one({'username': auth.username}) or admin.find_one({'username': auth.username})
        if user is not None:
            if bcrypt.checkpw(bytes(auth.password, 'UTF-8'), user['password']):
                token = jwt.encode({
                    'user': user['email'],
                    'role': user['role'],
                    'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=90)
                },secret_key ,algorithm='HS256')
                return make_response(jsonify({'token': token}), 200)
            else:
                return make_response(jsonify({'error': 'Password is incorrect'}), 401)
        else:
            return make_response(jsonify({'error': 'User not found'}), 404)
    return make_response(jsonify({'error': 'AUTHENTICATION REQUIRED'}), 401)