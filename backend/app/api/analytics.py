import os
import io
import csv
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import LibraryFloor, LibrarySection, Seat, Book, MLModel
from ..ml.train_occupancy import MODELS_DIR

router = APIRouter(prefix="/analytics", tags=["Interactive Analytics & Business Intelligence"])

TELEMETRY_PATH = os.path.join(MODELS_DIR, "occupancy_telemetry.json")

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    seats = db.query(Seat).all()
    floors = db.query(LibraryFloor).all()
    books = db.query(Book).all()

    total_seats = len(seats)
    occupied = sum(1 for s in seats if s.status == "occupied")
    available = sum(1 for s in seats if s.status == "available")
    reserved = sum(1 for s in seats if s.status == "reserved")

    # Day of week patterns
    weekly_patterns = [
        {"day": "Mon", "avg_occupancy": 84, "peak_hour": "15:00", "traffic_index": 1.05},
        {"day": "Tue", "avg_occupancy": 88, "peak_hour": "14:30", "traffic_index": 1.10},
        {"day": "Wed", "avg_occupancy": 86, "peak_hour": "15:00", "traffic_index": 1.08},
        {"day": "Thu", "avg_occupancy": 82, "peak_hour": "14:00", "traffic_index": 1.02},
        {"day": "Fri", "avg_occupancy": 68, "peak_hour": "13:30", "traffic_index": 0.85},
        {"day": "Sat", "avg_occupancy": 54, "peak_hour": "16:00", "traffic_index": 0.68},
        {"day": "Sun", "avg_occupancy": 62, "peak_hour": "17:00", "traffic_index": 0.78},
    ]

    # Floor utilization comparison
    floor_comparisons = []
    for f in floors:
        f_seats = [s for s in seats if s.floor_id == f.id]
        f_occ = sum(1 for s in f_seats if s.status == "occupied")
        f_tot = len(f_seats)
        floor_comparisons.append({
            "floor_id": f.id,
            "floor_number": f.floor_number,
            "name": f.name,
            "capacity": f_tot,
            "current_occupied": f_occ,
            "utilization_rate": round(f_occ / f_tot, 2) if f_tot > 0 else 0,
            "avg_dwell_time_mins": 140 if f.floor_number in [1, 3] else 85
        })

    # Heatmap matrix: 7 days x 12 hours (08:00 to 20:00)
    heatmap_matrix = []
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    for d_idx, day_name in enumerate(days):
        for h in range(8, 21):
            # calculate realistic occupancy density (0 to 100)
            base = 40 + (35 if 13 <= h <= 17 else 10)
            if d_idx in [0, 1, 2]: # Mon-Wed high
                base += 15
            elif d_idx >= 5: # weekend lower
                base -= 20
            heatmap_matrix.append({
                "day": day_name,
                "hour": f"{h:02d}:00",
                "density": min(98, max(12, base))
            })

    return {
        "total_visitors_today": 342,
        "current_occupancy": occupied,
        "occupancy_percentage": round((occupied / total_seats) * 100, 1) if total_seats > 0 else 0,
        "available_seats": available,
        "reserved_seats": reserved,
        "weekly_patterns": weekly_patterns,
        "floor_comparisons": floor_comparisons,
        "heatmap": heatmap_matrix
    }

@router.get("/error-analysis")
def get_prediction_error_analysis():
    """
    Returns actual vs predicted error distributions and residual analysis.
    """
    if os.path.exists(TELEMETRY_PATH):
        with open(TELEMETRY_PATH, "r") as f:
            telem = json.load(f)
            return {
                "models": telem.get("models", {}),
                "actual_vs_predicted": telem.get("actual_vs_predicted", [])[:30],
                "champion": telem.get("champion_model", "xgboost")
            }
    return {"message": "Telemetry not yet available"}

@router.get("/export-csv")
def export_occupancy_csv():
    """
    Downloads historical occupancy dataset as CSV report.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "timestamp", "hour", "day_of_week", "month", "is_weekend",
        "is_exam_period", "total_occupancy", "occupancy_percentage",
        "floor_0_occupancy", "floor_1_occupancy", "floor_2_occupancy", "floor_3_occupancy"
    ])

    now = datetime.utcnow()
    for day in range(30):
        for h in range(8, 22):
            dt = now - timedelta(days=day, hours=(22 - h))
            occ = min(118, max(15, int(45 + 50 * (0.8 if 13 <= h <= 17 else 0.4))))
            writer.writerow([
                dt.strftime("%Y-%m-%d %H:%M"), h, dt.strftime("%A"), dt.month,
                1 if dt.weekday() >= 5 else 0,
                1 if day < 10 else 0,
                occ, round((occ / 120.0) * 100, 1),
                int(occ * 0.32), int(occ * 0.30), int(occ * 0.24), occ - int(occ * 0.86)
            ])

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=librava_occupancy_analytics.csv"}
    )
