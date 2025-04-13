from email_validator import validate_email, EmailNotValidError

# This module contains validation functions for various fields used in the application.
# It includes functions to validate required fields, email addresses, username length, password length, and text input.
# The email validation uses the email-validator library to ensure that the provided email address is valid.

def validate_required_fields(data, required_fields):
    for field in required_fields:
        if field not in data:
            return f'{field} is required'
    return None

def validate_email_address(email):
    # Validate the email address using the email-validator library
    # This will raise an EmailNotValidError if the email is not valid
    # The email-validator library checks the syntax and domain of the email address.
    try:
        validate_email(email)
        return None
    except EmailNotValidError as e:
        return str(e)

def validate_username_length(username):
    if len(username) < 3 or len(username) > 20:
        return 'Username must be between 3 and 20 characters'
    return None

def validate_password_length(password):
    if len(password) < 6:
        return 'Password must be at least 6 characters long'
    return None

def validate_text(text):
    if not text.strip():
        return 'Text cannot be empty'
    return None