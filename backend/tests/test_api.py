import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "LIBRΛ" in data["system"]

def test_auth_login_student():
    response = client.post("/api/auth/login", json={
        "email": "student@librava.ai",
        "password": "StudentPass2026!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "student"

def test_auth_login_invalid():
    response = client.post("/api/auth/login", json={
        "email": "student@librava.ai",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401

def test_library_floors_and_seats():
    # Floors
    fl_res = client.get("/api/library/floors")
    assert fl_res.status_code == 200
    floors = fl_res.json()
    assert len(floors) == 4

    # Seats
    st_res = client.get("/api/library/seats")
    assert st_res.status_code == 200
    seats = st_res.json()
    assert len(seats) == 120
    # Verify 3D coordinates exist on seats
    first_seat = seats[0]
    assert "x_pos" in first_seat
    assert "y_pos" in first_seat
    assert "z_pos" in first_seat

def test_seat_reservation_and_double_booking_prevention():
    # 1. Login student
    auth_res = client.post("/api/auth/login", json={
        "email": "maya.lin@librava.ai",
        "password": "StudentPass2026!"
    })
    assert auth_res.status_code == 200
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Find an available seat
    seats = client.get("/api/library/seats?status=available").json()
    assert len(seats) > 0
    target_seat = seats[0]

    # 3. Reserve it
    res = client.post("/api/reservations", json={"seat_id": target_seat["id"], "duration_hours": 2}, headers=headers)
    assert res.status_code == 200
    res_data = res.json()
    assert res_data["seat_number"] == target_seat["seat_number"]
    assert res_data["status"] == "active"
    reservation_id = res_data["id"]

    # 4. Try reserving the same seat again with admin account (double-booking check)
    admin_auth = client.post("/api/auth/login", json={
        "email": "admin@librava.ai",
        "password": "AdminPass2026!"
    })
    admin_token = admin_auth.json()["access_token"]
    double_res = client.post(
        "/api/reservations",
        json={"seat_id": target_seat["id"], "duration_hours": 1},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert double_res.status_code == 400
    assert "cannot be reserved" in double_res.json()["detail"]

    # 5. Cancel reservation to release seat
    cancel_res = client.post(f"/api/reservations/{reservation_id}/cancel", headers=headers)
    assert cancel_res.status_code == 200

def test_predictions_forecast():
    res = client.get("/api/predictions/forecast")
    assert res.status_code == 200
    data = res.json()
    assert "predictions" in data
    assert len(data["predictions"]) == 5 # 30m, 1h, 3h, 6h, 24h
    assert len(data["hourly_24h_curve"]) == 24

def test_ml_telemetry():
    res = client.get("/api/ml/telemetry")
    assert res.status_code == 200
    telem = res.json()
    assert "models" in telem
    assert "champion_model" in telem
    assert "trees_3d" in telem
    assert "regression_surface_3d" in telem
    assert "data_points_3d" in telem

def test_ai_assistant():
    q_res = client.post("/api/assistant/chat", json={"question": "Which floor is least crowded?"})
    assert q_res.status_code == 200
    ans = q_res.json()
    assert ans["intent"] == "least_crowded_floor"
    assert "floor_name" in ans["data_points"]

def test_books_discovery_search():
    res = client.get("/api/discovery/search?q=algorithms&provider=all")
    assert res.status_code == 200
    books = res.json()
    assert isinstance(books, list)
    assert len(books) > 0
    first = books[0]
    assert "id" in first
    assert "source" in first
    assert "access_type" in first
    assert "title" in first

