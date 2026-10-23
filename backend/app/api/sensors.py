import datetime
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..core.websocket import manager
from ..models import SensorDevice, SensorEvent, OccupancyEvent, Seat
from ..schemas import SensorIngestEvent

router = APIRouter(prefix="/sensors", tags=["IoT Network & Hardware Telemetry"])

@router.get("")
def list_sensors(db: Session = Depends(get_db)):
    sensors = db.query(SensorDevice).all()
    results = []
    for s in sensors:
        results.append({
            "id": s.id,
            "device_code": s.device_code,
            "sensor_type": s.sensor_type,
            "floor_id": s.floor_id,
            "floor_number": s.floor.floor_number if s.floor else None,
            "section_id": s.section_id,
            "section_name": s.section.name if s.section else None,
            "status": s.status,
            "battery_level": s.battery_level,
            "ip_address": s.ip_address,
            "last_heartbeat": s.last_heartbeat
        })
    return results

@router.post("/ingest")
async def ingest_sensor_data(payload: SensorIngestEvent, db: Session = Depends(get_db)):
    """
    Hardware ingestion endpoint for ESP32, IR beam counters, PIR sensors, and RFID turnstiles.
    Anonymous occupancy tracking only (never stores facial or biometric identities).
    """
    sensor = db.query(SensorDevice).filter(SensorDevice.device_code == payload.device_code).first()
    if not sensor:
        raise HTTPException(status_code=404, detail=f"Sensor device '{payload.device_code}' not registered")

    now = datetime.datetime.utcnow()
    sensor.last_heartbeat = now
    
    # Record sensor event
    s_event = SensorEvent(
        sensor_id=sensor.id,
        event_type=payload.event_type,
        raw_payload=payload.raw_payload or f'{{"delta": {payload.count_delta}}}',
        timestamp=now
    )
    db.add(s_event)

    # Record occupancy event if count delta
    delta = payload.count_delta or 1
    if payload.event_type in ["entry", "motion", "pressure_on"]:
        count_change = delta
    elif payload.event_type in ["exit", "pressure_off"]:
        count_change = -delta
    else:
        count_change = 0

    if count_change != 0:
        occ_event = OccupancyEvent(
            section_id=sensor.section_id,
            event_type=f"sensor_{payload.event_type}",
            count_change=count_change,
            timestamp=now,
            sensor_id=sensor.id
        )
        db.add(occ_event)

    db.commit()

    # Broadcast event via WebSockets
    await manager.broadcast({
        "type": "SENSOR_TELEMETRY",
        "data": {
            "device_code": sensor.device_code,
            "sensor_type": sensor.sensor_type,
            "floor_id": sensor.floor_id,
            "event_type": payload.event_type,
            "count_change": count_change,
            "timestamp": now.isoformat()
        }
    })

    return {"status": "ingested", "device_code": sensor.device_code, "timestamp": now}

@router.post("/simulate-pulse")
async def simulate_iot_pulse(db: Session = Depends(get_db)):
    """
    Simulates a live IoT sensor pulse (e.g. someone walking through an IR turnstile or seating on a pressure sensor).
    """
    sensors = db.query(SensorDevice).filter(SensorDevice.status == "online").all()
    if not sensors:
        return {"message": "No online sensors"}
    
    chosen_sensor = random.choice(sensors)
    event_type = random.choice(["entry", "motion", "exit", "heartbeat"])
    delta = 1 if event_type in ["entry", "motion"] else (-1 if event_type == "exit" else 0)
    
    now = datetime.datetime.utcnow()
    chosen_sensor.last_heartbeat = now
    
    # Slightly vary battery
    chosen_sensor.battery_level = max(5.0, round(chosen_sensor.battery_level - 0.01, 1))

    # Occasionally toggle a seat status on that floor to reflect true dynamic twin updates!
    toggled_seat_data = None
    if random.random() < 0.4:
        seats_on_fl = db.query(Seat).filter(Seat.floor_id == chosen_sensor.floor_id).all()
        if seats_on_fl:
            seat_to_toggle = random.choice(seats_on_fl)
            old_stat = seat_to_toggle.status
            new_stat = "occupied" if old_stat == "available" else "available"
            seat_to_toggle.status = new_stat
            toggled_seat_data = {
                "seat_id": seat_to_toggle.id,
                "seat_number": seat_to_toggle.seat_number,
                "floor_id": seat_to_toggle.floor_id,
                "section_id": seat_to_toggle.section_id,
                "old_status": old_stat,
                "new_status": new_stat
            }

    db.commit()

    broadcast_payload = {
        "type": "SENSOR_PULSE",
        "data": {
            "device_code": chosen_sensor.device_code,
            "sensor_type": chosen_sensor.sensor_type,
            "floor_id": chosen_sensor.floor_id,
            "section_name": chosen_sensor.section.name if chosen_sensor.section else "General",
            "event_type": event_type,
            "count_change": delta,
            "battery_level": chosen_sensor.battery_level,
            "toggled_seat": toggled_seat_data
        }
    }
    await manager.broadcast(broadcast_payload)
    return broadcast_payload
