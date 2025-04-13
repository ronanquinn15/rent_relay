import datetime, jwt, bcrypt, globals
from flask import Blueprint, make_response, jsonify, request
from decorators import jwt_required
from validation import validate_required_fields, validate_email_address, validate_username_length, validate_password_length
auth_bp = Blueprint('auth', __name__)

blacklist = globals.db.blacklist
tenants = globals.db.tenants
landlords = globals.db.landlords
admin = globals.db.admin

# The point of this file is to handle authentication and authorization for the application.
# It includes routes for login, logout, and registration of users (tenants and landlords).
# It also includes validation functions to ensure that the data provided by users is valid and meets certain criteria.
# The login route checks the provided credentials against the database and returns a JWT token if they are valid.
# The logout route invalidates the token by adding it to a blacklist.
# The register route allows new users to create an account by providing their name, username, email, password, and role (tenant or landlord).
# The register route also checks for unique usernames and emails, and validates the provided data before creating a new user in the database.
# The JWT token is used for authentication and authorization in the application, allowing users to access protected routes and resources.


# This route handles user login and returns a JWT token if the credentials are valid.
@auth_bp.route('/api/login', methods=['GET'])
def login():
    auth = request.authorization
    if auth:
        # The username and password are obtained from the request authorisation header.
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

# This route handles user logout by adding the token to a blacklist.
@auth_bp.route('/api/logout', methods=['GET'])
@jwt_required
def logout():
    token = request.headers['x-access-token']
    blacklist.insert_one({'token': token})
    return make_response(jsonify({'message': 'Logged out successfully'}), 200)

# This route handles user registration for tenants and landlords.
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