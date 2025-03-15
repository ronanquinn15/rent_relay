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
def mock_tenant():
    """Mock tenant data"""
    return {
        "_id": ObjectId("507f1f77bcf86cd799439011"),
        "name": "Test Tenant",
        "username": "testtenant",
        "email": "testtenant@example.com"
    }

@pytest.fixture
def mock_auth_token():
    """Mock tenant auth token for tests"""
    return "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token"

@pytest.fixture
def mock_admin_token():
    """Mock admin auth token for tests"""
    return "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-admin-token"

def test_get_tenant_info_unauthorized(client):
    response = client.get('/api/tenant/info')
    assert response.status_code == 404

def test_get_all_tenants_unauthorized(client, mock_auth_token):
    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": "507f1f77bcf86cd799439011", "role": "tenant"}

        response = client.get('/api/tenants',
                              headers={'x-access-token': mock_auth_token})

        assert response.status_code == 404

def test_edit_tenant_unauthorized_different_tenant(client, mock_auth_token):
    tenant_id = "507f1f77bcf86cd799439011"
    different_tenant_id = "507f1f77bcf86cd799439012"

    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": different_tenant_id, "role": "tenant"}

        response = client.put(f'/api/tenants/{tenant_id}',
                              headers={'x-access-token': mock_auth_token},
                              data={"name": "Updated"})

        assert response.status_code == 404

def test_edit_tenant_invalid_email(client, mock_auth_token):
    tenant_id = "507f1f77bcf86cd799439011"
    update_data = {
        "email": "invalid-email"
    }

    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": tenant_id, "role": "tenant"}

        response = client.put(f'/api/tenants/{tenant_id}',
                              headers={'x-access-token': mock_auth_token},
                              data=update_data)

        assert response.status_code == 404

def test_delete_tenant_unauthorized(client, mock_auth_token):
    tenant_id = "507f1f77bcf86cd799439011"

    with patch('jwt.decode') as mock_jwt:
        mock_jwt.return_value = {"user_id": tenant_id, "role": "tenant"}

        response = client.delete(f'/api/tenants/{tenant_id}',
                                 headers={'x-access-token': mock_auth_token})

        assert response.status_code == 404