import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text, JSON, Enum
)
from sqlalchemy.orm import relationship
from ..core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False) # 'student', 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin_profile = relationship("AdminProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reservations = relationship("SeatReservation", back_populates="user")
    borrowings = relationship("BorrowingHistory", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_id_number = Column(String(100), unique=True, nullable=False)
    department = Column(String(150), default="Computer Science & AI")
    year_of_study = Column(Integer, default=3)
    preferred_noise_level = Column(String(50), default="quiet") # 'silent', 'quiet', 'collaborative'
    favorite_section_id = Column(Integer, nullable=True)

    user = relationship("User", back_populates="student_profile")


class AdminProfile(Base):
    __tablename__ = "admin_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    admin_role = Column(String(100), default="chief_librarian")
    department = Column(String(150), default="Library Operations & Systems")

    user = relationship("User", back_populates="admin_profile")


class LibraryFloor(Base):
    __tablename__ = "library_floors"

    id = Column(Integer, primary_key=True, index=True)
    floor_number = Column(Integer, unique=True, nullable=False) # 0, 1, 2, 3
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    total_capacity = Column(Integer, default=50)
    current_occupancy = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    noise_level_tag = Column(String(50), default="quiet")
    map_layer_3d_z = Column(Float, default=0.0)

    sections = relationship("LibrarySection", back_populates="floor", cascade="all, delete-orphan")
    seats = relationship("Seat", back_populates="floor")


class LibrarySection(Base):
    __tablename__ = "library_sections"

    id = Column(Integer, primary_key=True, index=True)
    floor_id = Column(Integer, ForeignKey("library_floors.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    section_type = Column(String(100), default="quiet") # 'silent', 'quiet', 'group_discussion', 'computer_lab', 'reading_lounge', 'reception'
    capacity = Column(Integer, default=20)
    current_occupancy = Column(Integer, default=0)
    noise_level = Column(String(50), default="moderate")
    coordinates_3d_x = Column(Float, default=0.0)
    coordinates_3d_y = Column(Float, default=0.0)
    coordinates_3d_z = Column(Float, default=0.0)

    floor = relationship("LibraryFloor", back_populates="sections")
    seats = relationship("Seat", back_populates="section", cascade="all, delete-orphan")
    sensor_devices = relationship("SensorDevice", back_populates="section")


class Seat(Base):
    __tablename__ = "seats"

    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, ForeignKey("library_sections.id", ondelete="CASCADE"), nullable=False)
    floor_id = Column(Integer, ForeignKey("library_floors.id", ondelete="CASCADE"), nullable=False)
    seat_number = Column(String(50), nullable=False)
    status = Column(String(50), default="available") # 'available', 'occupied', 'reserved', 'maintenance'
    has_power_outlet = Column(Boolean, default=True)
    has_monitor = Column(Boolean, default=False)
    near_window = Column(Boolean, default=False)
    x_pos = Column(Float, default=0.0)
    y_pos = Column(Float, default=0.0)
    z_pos = Column(Float, default=0.0)

    section = relationship("LibrarySection", back_populates="seats")
    floor = relationship("LibraryFloor", back_populates="seats")
    reservations = relationship("SeatReservation", back_populates="seat")


class SeatReservation(Base):
    __tablename__ = "seat_reservations"

    id = Column(Integer, primary_key=True, index=True)
    seat_id = Column(Integer, ForeignKey("seats.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String(50), default="active") # 'active', 'completed', 'cancelled', 'expired'
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    reservation_code = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    seat = relationship("Seat", back_populates="reservations")
    user = relationship("User", back_populates="reservations")


class OccupancyHistory(Base):
    __tablename__ = "occupancy_history"

    id = Column(Integer, primary_key=True, index=True)
    floor_id = Column(Integer, ForeignKey("library_floors.id", ondelete="SET NULL"), nullable=True)
    section_id = Column(Integer, ForeignKey("library_sections.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    count = Column(Integer, default=0)
    capacity = Column(Integer, default=100)
    occupancy_rate = Column(Float, default=0.0)


class OccupancyEvent(Base):
    __tablename__ = "occupancy_events"

    id = Column(Integer, primary_key=True, index=True)
    seat_id = Column(Integer, ForeignKey("seats.id", ondelete="SET NULL"), nullable=True)
    section_id = Column(Integer, ForeignKey("library_sections.id", ondelete="SET NULL"), nullable=True)
    event_type = Column(String(50), nullable=False) # 'seat_occupied', 'seat_vacated', 'door_entry', 'door_exit'
    count_change = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    sensor_id = Column(Integer, ForeignKey("sensor_devices.id", ondelete="SET NULL"), nullable=True)


class SensorDevice(Base):
    __tablename__ = "sensor_devices"

    id = Column(Integer, primary_key=True, index=True)
    device_code = Column(String(100), unique=True, index=True, nullable=False)
    sensor_type = Column(String(50), nullable=False) # 'ir_beam', 'pir_motion', 'rfid_gate', 'camera_counter', 'pressure_mat'
    section_id = Column(Integer, ForeignKey("library_sections.id", ondelete="SET NULL"), nullable=True)
    floor_id = Column(Integer, ForeignKey("library_floors.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="online") # 'online', 'offline', 'warning'
    battery_level = Column(Float, default=100.0)
    ip_address = Column(String(100), default="192.168.1.101")
    last_heartbeat = Column(DateTime, default=datetime.datetime.utcnow)

    section = relationship("LibrarySection", back_populates="sensor_devices")
    events = relationship("SensorEvent", back_populates="sensor")


class SensorEvent(Base):
    __tablename__ = "sensor_events"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensor_devices.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False) # 'motion', 'entry', 'exit', 'pressure_on', 'heartbeat'
    raw_payload = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    sensor = relationship("SensorDevice", back_populates="events")


class BookCategory(Base):
    __tablename__ = "book_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    books = relationship("Book", back_populates="category")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("book_categories.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False)
    isbn = Column(String(50), unique=True, nullable=False)
    publisher = Column(String(150), default="Quantum Academic Press")
    publication_year = Column(Integer, default=2024)
    call_number = Column(String(100), nullable=False)
    total_copies = Column(Integer, default=5)
    available_copies = Column(Integer, default=3)
    borrow_count_lifetime = Column(Integer, default=12)
    demand_score = Column(Float, default=0.75) # 0 to 1
    cover_url = Column(String(255), nullable=True)

    category = relationship("BookCategory", back_populates="books")
    copies = relationship("BookCopy", back_populates="book", cascade="all, delete-orphan")
    borrowings = relationship("BorrowingHistory", back_populates="book")


class BookCopy(Base):
    __tablename__ = "book_copies"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    barcode = Column(String(100), unique=True, nullable=False)
    copy_number = Column(Integer, default=1)
    status = Column(String(50), default="available") # 'available', 'borrowed', 'reserved', 'repair'

    book = relationship("Book", back_populates="copies")


class BorrowingHistory(Base):
    __tablename__ = "borrowing_history"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    borrow_date = Column(DateTime, default=datetime.datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="active") # 'active', 'returned', 'overdue'

    book = relationship("Book", back_populates="borrowings")
    user = relationship("User", back_populates="borrowings")


class ExaminationSchedule(Base):
    __tablename__ = "examination_schedule"

    id = Column(Integer, primary_key=True, index=True)
    exam_name = Column(String(200), nullable=False)
    department = Column(String(150), default="All Engineering & Sciences")
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    expected_footfall_multiplier = Column(Float, default=1.65)


class Holiday(Base):
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    holiday_date = Column(DateTime, nullable=False)
    is_closed = Column(Boolean, default=False)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ml_models.id", ondelete="SET NULL"), nullable=True)
    target_metric = Column(String(100), default="library_occupancy") # 'library_occupancy', 'floor_occupancy', 'book_demand'
    horizon = Column(String(50), default="1h") # '30m', '1h', '3h', '6h', '24h'
    target_id = Column(Integer, nullable=True) # Floor ID or Book ID
    predicted_value = Column(Float, nullable=False)
    actual_value = Column(Float, nullable=True)
    confidence_lower = Column(Float, nullable=True)
    confidence_upper = Column(Float, nullable=True)
    prediction_for_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class MLModel(Base):
    __tablename__ = "ml_models"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(150), nullable=False)
    model_type = Column(String(100), nullable=False) # 'linear_regression', 'random_forest', 'xgboost', 'book_demand_rf'
    version = Column(String(50), default="v1.0")
    file_path = Column(String(255), nullable=True)
    mae = Column(Float, default=0.0)
    rmse = Column(Float, default=0.0)
    r2 = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)

    training_runs = relationship("MLTrainingRun", back_populates="model")


class MLTrainingRun(Base):
    __tablename__ = "ml_training_runs"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ml_models.id", ondelete="SET NULL"), nullable=True)
    algorithm = Column(String(100), nullable=False)
    dataset_size = Column(Integer, default=5000)
    features_used = Column(JSON, nullable=True)
    hyperparameters = Column(JSON, nullable=True)
    metrics_json = Column(JSON, nullable=True)
    status = Column(String(50), default="completed") # 'in_progress', 'completed', 'failed'
    duration_seconds = Column(Float, default=1.5)
    logs = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    model = relationship("MLModel", back_populates="training_runs")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    recommendation_type = Column(String(100), nullable=False) # 'seat_zone', 'optimal_time', 'book', 'less_crowded_floor'
    target_reference = Column(String(255), nullable=False) # Section Name, Book Title, or Hour
    confidence_score = Column(Float, default=0.92)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info") # 'booking_reminder', 'crowd_alert', 'book_available', 'shortage_warning'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(150), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(100), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
