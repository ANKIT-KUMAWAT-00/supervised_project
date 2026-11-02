import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import Base, engine, SessionLocal
from .core.websocket import manager
from .seed_data import seed_database
from .models import SensorDevice, Seat
import random

# Import API routers
from .api.auth import router as auth_router
from .api.library import router as library_router
from .api.reservations import router as reservations_router
from .api.occupancy import router as occupancy_router
from .api.predictions import router as predictions_router
from .api.ml_lab import router as ml_lab_router
from .api.books import router as books_router
from .api.recommendations import router as recommendations_router
from .api.assistant import router as assistant_router
from .api.sensors import router as sensors_router
from .api.analytics import router as analytics_router
from .api.notifications import router as notifications_router
from .api.books_discovery import router as books_discovery_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous Smart Library Occupancy & Resource Intelligence Platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(library_router, prefix=settings.API_V1_STR)
app.include_router(reservations_router, prefix=settings.API_V1_STR)
app.include_router(occupancy_router, prefix=settings.API_V1_STR)
app.include_router(predictions_router, prefix=settings.API_V1_STR)
app.include_router(ml_lab_router, prefix=settings.API_V1_STR)
app.include_router(books_router, prefix=settings.API_V1_STR)
app.include_router(recommendations_router, prefix=settings.API_V1_STR)
app.include_router(assistant_router, prefix=settings.API_V1_STR)
app.include_router(sensors_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(notifications_router, prefix=settings.API_V1_STR)
app.include_router(books_discovery_router, prefix=settings.API_V1_STR)

# Live WebSocket Endpoint
@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial welcome and state heartbeat
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "message": "Connected to LIBRΛ Quantum Telemetry Stream",
            "active_clients": len(manager.active_connections)
        })
        while True:
            data = await websocket.receive_text()
            # Respond to client ping or commands
            await websocket.send_json({"type": "PONG", "echo": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# Background IoT Sensor Simulator Task
async def periodic_sensor_simulator():
    """
    Periodically generates lightweight simulated sensor events and occasional seat occupancy changes
    to drive live interactive 3D and dashboard telemetry.
    """
    await asyncio.sleep(2)
    while True:
        try:
            if len(manager.active_connections) > 0:
                db = SessionLocal()
                try:
                    sensors = db.query(SensorDevice).all()
                    if sensors:
                        s = random.choice(sensors)
                        event_type = random.choice(["motion", "entry", "exit", "heartbeat"])
                        delta = 1 if event_type in ["entry", "motion"] else (-1 if event_type == "exit" else 0)
                        
                        toggled_seat_data = None
                        if random.random() < 0.25:
                            seats_on_fl = db.query(Seat).filter(Seat.floor_id == s.floor_id).all()
                            if seats_on_fl:
                                st = random.choice(seats_on_fl)
                                if st.status in ["available", "occupied"]:
                                    old_status = st.status
                                    new_status = "occupied" if old_status == "available" else "available"
                                    st.status = new_status
                                    db.commit()
                                    toggled_seat_data = {
                                        "seat_id": st.id,
                                        "seat_number": st.seat_number,
                                        "floor_id": st.floor_id,
                                        "section_id": st.section_id,
                                        "old_status": old_status,
                                        "new_status": new_status
                                    }

                        await manager.broadcast({
                            "type": "SENSOR_PULSE",
                            "data": {
                                "device_code": s.device_code,
                                "sensor_type": s.sensor_type,
                                "floor_id": s.floor_id,
                                "event_type": event_type,
                                "count_change": delta,
                                "battery_level": s.battery_level,
                                "toggled_seat": toggled_seat_data
                            }
                        })
                finally:
                    db.close()
        except Exception as e:
            print(f"Error in background simulator: {e}")
        await asyncio.sleep(settings.SIMULATION_INTERVAL_SECONDS)

@app.on_event("startup")
async def startup_event():
    print("Initiating LIBRΛ Intelligence Server...")
    seed_database()
    # Start background sensor simulation task
    asyncio.create_task(periodic_sensor_simulator())

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "LIBRΛ Smart Library Intelligence Engine",
        "version": settings.VERSION,
        "websocket_clients": len(manager.active_connections)
    }
