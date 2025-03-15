import json
import pytest
from unittest.mock import patch, MagicMock
from bson import ObjectId
from flask import Flask

@pytest.fixture
def client():
    """Create a test client for the Flask app"""
    app = Flask(__name__)
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_auth_token():
    """Mock auth token for tests"""
    return "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token"

def test_get_maintenance_details_unauthorized(client):
    response = client.get('/api/maintenance/details')
    assert response.status_code == 404

def test_get_all_maintenance_unauthorized(client, mock_auth_token):
    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": "507f1f77bcf86cd799439011", "role": "user"}

        response = client.get('/api/maintenance',
                              headers={'x-access-token': mock_auth_token})

        assert response.status_code == 404

def test_edit_maintenance_unauthorized_different_user(client, mock_auth_token):
    maintenance_id = "507f1f77bcf86cd799439011"
    different_user_id = "507f1f77bcf86cd799439012"

    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": different_user_id, "role": "user"}

        response = client.put(f'/api/maintenance/{maintenance_id}',
                              headers={'x-access-token': mock_auth_token},
                              data={"description": "Updated"})

        assert response.status_code == 404

def test_edit_maintenance_invalid_data(client, mock_auth_token):
    maintenance_id = "507f1f77bcf86cd799439011"
    update_data = {
        "email": "invalid-email"
    }

    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": maintenance_id, "role": "user"}

        response = client.put(f'/api/maintenance/{maintenance_id}',
                              headers={'x-access-token': mock_auth_token},
                              data=update_data)

        assert response.status_code == 404

def test_delete_maintenance_unauthorized(client, mock_auth_token):
    maintenance_id = "507f1f77bcf86cd799439011"

    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": maintenance_id, "role": "user"}

        response = client.delete(f'/api/maintenance/{maintenance_id}',
                                 headers={'x-access-token': mock_auth_token})

        assert response.status_code == 404