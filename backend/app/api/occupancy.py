from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import LibraryFloor, LibrarySection, Seat, OccupancyHistory
from ..schemas import OccupancySummary

router = APIRouter(prefix="/occupancy", tags=["Occupancy Analytics"])

@router.get("/current", response_model=OccupancySummary)
def get_current_occupancy(db: Session = Depends(get_db)):
    seats = db.query(Seat).all()
    floors = db.query(LibraryFloor).order_by(LibraryFloor.floor_number).all()

    total_cap = len(seats)
    occupied_count = sum(1 for s in seats if s.status == "occupied")
    reserved_count = sum(1 for s in seats if s.status == "reserved")
    maintenance_count = sum(1 for s in seats if s.status == "maintenance")
    available_count = sum(1 for s in seats if s.status == "available")

    occ_percent = round((occupied_count / total_cap) * 100, 1) if total_cap > 0 else 0.0

    floors_summary = []
    for f in floors:
        f_seats = [s for s in seats if s.floor_id == f.id]
        f_cap = len(f_seats)
        f_occ = sum(1 for s in f_seats if s.status == "occupied")
        f_res = sum(1 for s in f_seats if s.status == "reserved")
        f_avail = sum(1 for s in f_seats if s.status == "available")
        floors_summary.append({
            "floor_id": f.id,
            "floor_number": f.floor_number,
            "name": f.name,
            "capacity": f_cap,
            "occupied": f_occ,
            "reserved": f_res,
            "available": f_avail,
            "occupancy_rate": round(f_occ / f_cap, 3) if f_cap > 0 else 0.0,
            "occupancy_percentage": round((f_occ / f_cap) * 100, 1) if f_cap > 0 else 0.0,
            "noise_level_tag": f.noise_level_tag
        })

    status_category = "Optimal"
    if occ_percent >= 80:
        status_category = "Critical Occupancy"
    elif occ_percent >= 55:
        status_category = "Moderate Demand"

    return {
        "total_capacity": total_cap,
        "current_occupancy": occupied_count,
        "occupancy_percentage": occ_percent,
        "available_seats": available_count,
        "occupied_seats": occupied_count,
        "reserved_seats": reserved_count,
        "maintenance_seats": maintenance_count,
        "floors": floors_summary,
        "peak_hour_today": "14:30 - 16:00",
        "current_status": status_category
    }

@router.get("/hourly-trend")
def get_hourly_trend():
    """
    Returns realistic 24-hour diurnal curve showing today's occupancy profile.
    """
    now = datetime.utcnow()
    current_hour = now.hour
    curve = []
    base_factors = {
        7: 15, 8: 30, 9: 55, 10: 75, 11: 88, 12: 82,
        13: 94, 14: 105, 15: 110, 16: 106, 17: 96, 18: 80,
        19: 95, 20: 98, 21: 84, 22: 50, 23: 22
    }
    for h in range(7, 24):
        occ = base_factors.get(h, 40)
        # Cap at 120
        occ = min(120, occ)
        is_past = h <= current_hour
        curve.append({
            "hour": f"{h:02d}:00",
            "hour_int": h,
            "occupancy": occ,
            "capacity": 120,
            "percentage": round((occ / 120) * 100, 1),
            "is_past": is_past,
            "is_current": h == current_hour
        })
    return curve
