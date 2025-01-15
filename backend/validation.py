from email_validator import validate_email, EmailNotValidError

def validate_required_fields(data, required_fields):
    for field in required_fields:
        if field not in data:
            return f'{field} is required'
    return None

def validate_email_address(email):
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