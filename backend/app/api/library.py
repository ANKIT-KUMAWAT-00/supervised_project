from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..core.websocket import manager
from ..models import LibraryFloor, LibrarySection, Seat, OccupancyEvent
from ..schemas import LibraryFloorResponse, LibrarySectionResponse, SeatResponse

router = APIRouter(prefix="/library", tags=["Library & Digital Twin"])

@router.get("/floors", response_model=List[LibraryFloorResponse])
def get_floors(db: Session = Depends(get_db)):
    floors = db.query(LibraryFloor).order_by(LibraryFloor.floor_number).all()
    # Recalculate dynamic occupancy from seats
    for f in floors:
        seats = db.query(Seat).filter(Seat.floor_id == f.id).all()
        f.current_occupancy = sum(1 for s in seats if s.status == "occupied")
        f.total_capacity = len(seats)
    return floors

@router.get("/sections", response_model=List[LibrarySectionResponse])
def get_sections(floor_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(LibrarySection)
    if floor_id is not None:
        query = query.filter(LibrarySection.floor_id == floor_id)
    sections = query.all()
    for s in sections:
        seats = db.query(Seat).filter(Seat.section_id == s.id).all()
        s.current_occupancy = sum(1 for seat in seats if seat.status == "occupied")
        s.capacity = len(seats)
    return sections

@router.get("/seats", response_model=List[SeatResponse])
def get_seats(
    floor_id: Optional[int] = None,
    section_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Seat)
    if floor_id is not None:
        query = query.filter(Seat.floor_id == floor_id)
    if section_id is not None:
        query = query.filter(Seat.section_id == section_id)
    if status is not None:
        query = query.filter(Seat.status == status)
    
    seats = query.order_by(Seat.id).all()
    result = []
    for s in seats:
        seat_dict = {
            "id": s.id,
            "section_id": s.section_id,
            "floor_id": s.floor_id,
            "seat_number": s.seat_number,
            "status": s.status,
            "has_power_outlet": s.has_power_outlet,
            "has_monitor": s.has_monitor,
            "near_window": s.near_window,
            "x_pos": s.x_pos,
            "y_pos": s.y_pos,
            "z_pos": s.z_pos,
            "section_name": s.section.name if s.section else None,
            "floor_name": s.floor.name if s.floor else None
        }
        result.append(seat_dict)
    return result

@router.get("/seats/{seat_id}", response_model=SeatResponse)
def get_seat(seat_id: int, db: Session = Depends(get_db)):
    seat = db.query(Seat).filter(Seat.id == seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    return {
        "id": seat.id,
        "section_id": seat.section_id,
        "floor_id": seat.floor_id,
        "seat_number": seat.seat_number,
        "status": seat.status,
        "has_power_outlet": seat.has_power_outlet,
        "has_monitor": seat.has_monitor,
        "near_window": seat.near_window,
        "x_pos": seat.x_pos,
        "y_pos": seat.y_pos,
        "z_pos": seat.z_pos,
        "section_name": seat.section.name if seat.section else None,
        "floor_name": seat.floor.name if seat.floor else None
    }

@router.patch("/seats/{seat_id}/status")
async def update_seat_status(seat_id: int, new_status: str, db: Session = Depends(get_db)):
    valid_statuses = ["available", "occupied", "reserved", "maintenance"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
    
    seat = db.query(Seat).filter(Seat.id == seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    
    old_status = seat.status
    seat.status = new_status
    db.commit()

    # Broadcast seat update via WebSockets
    await manager.broadcast({
        "type": "SEAT_STATUS_UPDATED",
        "data": {
            "seat_id": seat.id,
            "seat_number": seat.seat_number,
            "floor_id": seat.floor_id,
            "section_id": seat.section_id,
            "old_status": old_status,
            "new_status": new_status
        }
    })

    return {"message": "Seat status updated", "seat_id": seat.id, "new_status": new_status}
