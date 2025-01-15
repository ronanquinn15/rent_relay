import datetime, jwt, bcrypt, globals
from flask import Blueprint, make_response, jsonify, request
from decorators import jwt_required
from validation import validate_required_fields, validate_email_address, validate_username_length, validate_password_length
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

@auth_bp.route('/api/register', methods=['POST'])
def register():
    try:
        # Get form data
        name = request.form.get('name')
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        role = request.form.get('role')

        # Validate required fields
        error = validate_required_fields(request.form, ['name', 'username', 'email', 'password', 'role'])
        if error:
            return make_response(jsonify({'error': error}), 400)

        # Validate email
        error = validate_email_address(email)
        if error:
            return make_response(jsonify({'error': error}), 400)

        # Validate username length
        error = validate_username_length(username)
        if error:
            return make_response(jsonify({'error': error}), 400)

        # Validate password length
        error = validate_password_length(password)
        if error:
            return make_response(jsonify({'error': error}), 400)

        # Validate role
        if role not in ['tenant', 'landlord']:
            return make_response(jsonify({'error': 'Role must be either tenant or landlord'}), 400)

        # Check if username is unique
        if tenants.find_one({'username': username}) or landlords.find_one({'username': username}) or admin.find_one({'username': username}):
            return make_response(jsonify({'error': 'Username already exists'}), 400)

        # Check if email is unique
        if tenants.find_one({'email': email}) or landlords.find_one({'email': email}) or admin.find_one({'email': email}):
            return make_response(jsonify({'error': 'Email already exists'}), 400)

        # Encrypt password
        hashed_password = bcrypt.hashpw(bytes(password, 'UTF-8'), bcrypt.gensalt())

        # Create user object
        user = {
            'name': name,
            'username': username,
            'email': email,
            'password': hashed_password,
            'role': role
        }

        # Add property_id for tenants
        if role == 'tenant':
            user['property_id'] = None
            tenants.insert_one(user)
        elif role == 'landlord':
            landlords.insert_one(user)
        else:
            return make_response(jsonify({'error': 'Invalid role'}), 400)

        return make_response(jsonify({'message': 'User registered successfully'}), 201)

    except Exception as e:
        return make_response(jsonify({'error': str(e)}), 500)