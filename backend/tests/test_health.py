import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "UniAssist API is running"
    assert data["status"] == "healthy"
    assert "version" in data

def test_health_endpoint_structure():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "knowledge_base" in data
    kb = data["knowledge_base"]
    assert kb["status"] == "active"
    assert isinstance(kb["indexed_documents"], int)
    assert kb["indexed_documents"] >= 0
    assert kb["version"] == "2026.1"

def test_health_endpoint_no_secrets_leaked():
    response = client.get("/api/health")
    content = response.text.lower()
    assert "api_key" not in content
    assert "password" not in content
    assert "secret" not in content
    assert "traceback" not in content

def test_cors_headers():
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    # FastApi CORS allows origin
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
