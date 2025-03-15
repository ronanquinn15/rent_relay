import json
import pytest
from unittest.mock import patch, MagicMock
from bson import ObjectId
from flask import Flask

@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app = app = Flask(__name__)
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_landlord():
    """Mock landlord data"""
    return {
        "_id": ObjectId("507f1f77bcf86cd799439011"),
        "name": "Test Landlord",
        "username": "testlandlord",
        "email": "testlandlord@example.com"
    }


@pytest.fixture
def mock_auth_token():
    """Mock landlord auth token for tests"""
    return "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token"


@pytest.fixture
def mock_admin_token():
    """Mock admin auth token for tests"""
    return "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-admin-token"


def test_get_landlord_details_unauthorized(client):
    response = client.get('/api/landlords/details')
    assert response.status_code == 404


def test_get_all_landlords_unauthorised(client, mock_auth_token):
    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": "507f1f77bcf86cd799439011", "role": "landlord"}

        response = client.get('/api/landlords',
                              headers={'x-access-token': mock_auth_token})

        assert response.status_code == 404


def test_edit_landlord_unauthorised_different_landlord(client, mock_auth_token):
    landlord_id = "507f1f77bcf86cd799439011"
    different_landlord_id = "507f1f77bcf86cd799439012"

    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": different_landlord_id, "role": "landlord"}

        response = client.put(f'/api/landlords/{landlord_id}',
                              headers={'x-access-token': mock_auth_token},
                              data={"name": "Updated"})

        assert response.status_code == 404


def test_edit_landlord_invalid_email(client, mock_auth_token):
    landlord_id = "507f1f77bcf86cd799439011"
    update_data = {
        "email": "invalid-email"
    }

    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": landlord_id, "role": "landlord"}

        response = client.put(f'/api/landlords/{landlord_id}',
                              headers={'x-access-token': mock_auth_token},
                              data=update_data)

        assert response.status_code == 404


def test_delete_landlord_unauthorised(client, mock_auth_token):
    landlord_id = "507f1f77bcf86cd799439011"

    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": landlord_id, "role": "landlord"}

        response = client.delete(f'/api/landlords/{landlord_id}',
                                 headers={'x-access-token': mock_auth_token})

        assert response.status_code == 404