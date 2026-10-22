import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.dependencies import get_current_user
from ..core.websocket import manager
from ..models import User, Seat, SeatReservation, Notification, AuditLog
from ..schemas import ReservationCreate, ReservationResponse
from typing import List

router = APIRouter(prefix="/reservations", tags=["Seat Reservations"])

@router.post("", response_model=ReservationResponse)
async def create_reservation(
    res_in: ReservationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce atomic transaction and seat check
    # Check if seat exists
    seat = db.query(Seat).filter(Seat.id == res_in.seat_id).with_for_update().first()
    if not seat:
        raise HTTPException(status_code=404, detail="Requested seat does not exist")
    
    if seat.status != "available":
        raise HTTPException(
            status_code=400,
            detail=f"Seat {seat.seat_number} is currently '{seat.status}' and cannot be reserved"
        )
    
    # Check if student already has an active reservation
    active_res = db.query(SeatReservation).filter(
        SeatReservation.user_id == current_user.id,
        SeatReservation.status == "active"
    ).first()
    if active_res:
        raise HTTPException(
            status_code=400,
            detail=f"You already have an active reservation ({active_res.reservation_code}). Please complete or cancel it first."
        )

    start = res_in.start_time or datetime.utcnow()
    duration = min(max(res_in.duration_hours, 1), 6) # max 6 hours
    end = start + timedelta(hours=duration)
    code = f"LIBRA-{uuid.uuid4().hex[:6].upper()}"

    # Update seat status
    seat.status = "reserved"

    reservation = SeatReservation(
        seat_id=seat.id,
        user_id=current_user.id,
        start_time=start,
        end_time=end,
        status="active",
        reservation_code=code
    )
    db.add(reservation)
    db.flush()

    # Create notification
    notif = Notification(
        user_id=current_user.id,
        title="Seat Reservation Confirmed",
        message=f"Seat {seat.seat_number} on Level {seat.floor.floor_number} is reserved until {end.strftime('%H:%M')}. Reservation Code: {code}",
        notification_type="booking_reminder"
    )
    db.add(notif)

    # Log audit
    audit = AuditLog(
        user_id=current_user.id,
        action="SEAT_RESERVATION_CREATED",
        entity_type="SeatReservation",
        entity_id=str(reservation.id),
        details={"seat_number": seat.seat_number, "reservation_code": code}
    )
    db.add(audit)

    db.commit()
    db.refresh(reservation)

    # Broadcast seat change
    await manager.broadcast({
        "type": "SEAT_STATUS_UPDATED",
        "data": {
            "seat_id": seat.id,
            "seat_number": seat.seat_number,
            "floor_id": seat.floor_id,
            "section_id": seat.section_id,
            "old_status": "available",
            "new_status": "reserved"
        }
    })

    return {
        "id": reservation.id,
        "seat_id": seat.id,
        "user_id": current_user.id,
        "seat_number": seat.seat_number,
        "floor_number": seat.floor.floor_number,
        "section_name": seat.section.name,
        "start_time": reservation.start_time,
        "end_time": reservation.end_time,
        "status": reservation.status,
        "reservation_code": reservation.reservation_code,
        "check_in_time": reservation.check_in_time,
        "created_at": reservation.created_at
    }

@router.get("/my", response_model=List[ReservationResponse])
def get_my_reservations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reservations = db.query(SeatReservation).filter(
        SeatReservation.user_id == current_user.id
    ).order_by(SeatReservation.created_at.desc()).all()

    results = []
    for r in reservations:
        results.append({
            "id": r.id,
            "seat_id": r.seat.id,
            "user_id": r.user_id,
            "seat_number": r.seat.seat_number,
            "floor_number": r.seat.floor.floor_number,
            "section_name": r.seat.section.name,
            "start_time": r.start_time,
            "end_time": r.end_time,
            "status": r.status,
            "reservation_code": r.reservation_code,
            "check_in_time": r.check_in_time,
            "created_at": r.created_at
        })
    return results

@router.post("/{reservation_id}/check-in")
async def check_in(reservation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = db.query(SeatReservation).filter(
        SeatReservation.id == reservation_id,
        SeatReservation.user_id == current_user.id
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if res.status != "active":
        raise HTTPException(status_code=400, detail=f"Cannot check-in to a reservation with status '{res.status}'")
    
    res.check_in_time = datetime.utcnow()
    res.seat.status = "occupied"
    db.commit()

    await manager.broadcast({
        "type": "SEAT_STATUS_UPDATED",
        "data": {
            "seat_id": res.seat.id,
            "seat_number": res.seat.seat_number,
            "floor_id": res.seat.floor_id,
            "section_id": res.seat.section_id,
            "old_status": "reserved",
            "new_status": "occupied"
        }
    })

    return {"message": "Check-in successful", "check_in_time": res.check_in_time}

@router.post("/{reservation_id}/check-out")
async def check_out(reservation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = db.query(SeatReservation).filter(
        SeatReservation.id == reservation_id,
        SeatReservation.user_id == current_user.id
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    res.status = "completed"
    res.check_out_time = datetime.utcnow()
    res.seat.status = "available"
    db.commit()

    await manager.broadcast({
        "type": "SEAT_STATUS_UPDATED",
        "data": {
            "seat_id": res.seat.id,
            "seat_number": res.seat.seat_number,
            "floor_id": res.seat.floor_id,
            "section_id": res.seat.section_id,
            "old_status": "occupied",
            "new_status": "available"
        }
    })

    return {"message": "Check-out completed. Seat is now available for other students."}

@router.post("/{reservation_id}/cancel")
async def cancel_reservation(reservation_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = db.query(SeatReservation).filter(
        SeatReservation.id == reservation_id,
        SeatReservation.user_id == current_user.id
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if res.status != "active":
        raise HTTPException(status_code=400, detail=f"Cannot cancel a reservation that is '{res.status}'")
    
    res.status = "cancelled"
    res.seat.status = "available"
    db.commit()

    await manager.broadcast({
        "type": "SEAT_STATUS_UPDATED",
        "data": {
            "seat_id": res.seat.id,
            "seat_number": res.seat.seat_number,
            "floor_id": res.seat.floor_id,
            "section_id": res.seat.section_id,
            "old_status": "reserved",
            "new_status": "available"
        }
    })

    return {"message": "Reservation cancelled. Seat has been released."}

@router.get("/all")
def get_all_reservations(db: Session = Depends(get_db)):
    # Admin route
    reservations = db.query(SeatReservation).order_by(SeatReservation.created_at.desc()).limit(100).all()
    results = []
    for r in reservations:
        results.append({
            "id": r.id,
            "seat_number": r.seat.seat_number,
            "user_name": r.user.full_name,
            "user_email": r.user.email,
            "floor_number": r.seat.floor.floor_number,
            "section_name": r.seat.section.name,
            "start_time": r.start_time,
            "end_time": r.end_time,
            "status": r.status,
            "reservation_code": r.reservation_code,
            "created_at": r.created_at
        })
    return results
