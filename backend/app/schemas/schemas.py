from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth & User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "student"

class UserCreate(UserBase):
    password: str
    student_id_number: Optional[str] = "STU-2026-001"
    department: Optional[str] = "Computer Science & AI"
    preferred_noise_level: Optional[str] = "quiet"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    student_profile: Optional[Dict[str, Any]] = None
    admin_profile: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- Library & Seat Schemas ---
class SeatBase(BaseModel):
    seat_number: str
    status: str
    has_power_outlet: bool = True
    has_monitor: bool = False
    near_window: bool = False
    x_pos: float
    y_pos: float
    z_pos: float

class SeatResponse(SeatBase):
    id: int
    section_id: int
    floor_id: int
    section_name: Optional[str] = None
    floor_name: Optional[str] = None

    class Config:
        from_attributes = True

class LibrarySectionResponse(BaseModel):
    id: int
    floor_id: int
    name: str
    code: str
    section_type: str
    capacity: int
    current_occupancy: int
    noise_level: str
    coordinates_3d_x: float
    coordinates_3d_y: float
    coordinates_3d_z: float

    class Config:
        from_attributes = True

class LibraryFloorResponse(BaseModel):
    id: int
    floor_number: int
    name: str
    description: Optional[str]
    total_capacity: int
    current_occupancy: int
    noise_level_tag: str
    map_layer_3d_z: float
    sections: List[LibrarySectionResponse] = []

    class Config:
        from_attributes = True

# --- Reservation Schemas ---
class ReservationCreate(BaseModel):
    seat_id: int
    start_time: Optional[datetime] = None
    duration_hours: int = 2

class ReservationResponse(BaseModel):
    id: int
    seat_id: int
    user_id: int
    seat_number: str
    floor_number: int
    section_name: str
    start_time: datetime
    end_time: datetime
    status: str
    reservation_code: str
    check_in_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Occupancy Schemas ---
class OccupancySummary(BaseModel):
    total_capacity: int
    current_occupancy: int
    occupancy_percentage: float
    available_seats: int
    occupied_seats: int
    reserved_seats: int
    maintenance_seats: int
    floors: List[Dict[str, Any]]
    peak_hour_today: str
    current_status: str

# --- Prediction Schemas ---
class PredictionItem(BaseModel):
    horizon: str
    target_time: str
    predicted_occupancy: int
    predicted_percentage: float
    confidence_interval: List[int]
    status_category: str

class OccupancyForecastResponse(BaseModel):
    champion_model: str
    forecast_generated_at: str
    predictions: List[PredictionItem]
    hourly_24h_curve: List[Dict[str, Any]]

# --- Recommendation Schemas ---
class ZoneRecommendation(BaseModel):
    section_id: int
    section_name: str
    floor_name: str
    floor_number: int
    noise_level: str
    available_seats: int
    occupancy_rate: float
    match_score: float
    reasons: List[str]

class BookRecommendation(BaseModel):
    book_id: int
    title: str
    author: str
    category: str
    available_copies: int
    match_score: float
    reasons: List[str]

# --- Assistant Schemas ---
class AssistantQuery(BaseModel):
    question: str

class AssistantResponse(BaseModel):
    answer: str
    intent: str
    data_points: Optional[Dict[str, Any]] = None
    suggestions: List[str] = []

# --- Sensor Schemas ---
class SensorIngestEvent(BaseModel):
    device_code: str
    event_type: str
    count_delta: Optional[int] = 1
    raw_payload: Optional[str] = None
