import datetime
from sqlalchemy.orm import Session
from .core.database import Base, engine, SessionLocal
from .core.security import get_password_hash
from .models import (
    User, StudentProfile, AdminProfile,
    LibraryFloor, LibrarySection, Seat, SeatReservation,
    SensorDevice, SensorEvent, BookCategory, Book, BookCopy,
    BorrowingHistory, ExaminationSchedule, Holiday,
    MLModel, MLTrainingRun, Recommendation, Notification, AuditLog
)

def seed_database():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    # Check if already seeded
    if db.query(User).filter_by(email="admin@librava.ai").first():
        print("Database already contains seed data. Refreshing dynamic states...")
        db.close()
        return

    print("Seeding Users & Profiles...")
    # Admin User
    admin = User(
        email="admin@librava.ai",
        hashed_password=get_password_hash("AdminPass2026!"),
        full_name="Dr. Elena Vance (Chief Intelligence Director)",
        role="admin"
    )
    db.add(admin)
    db.flush()

    admin_profile = AdminProfile(
        user_id=admin.id,
        admin_role="Chief Systems Architect & Librarian",
        department="Autonomous Library Operations"
    )
    db.add(admin_profile)

    # Student User
    student = User(
        email="student@librava.ai",
        hashed_password=get_password_hash("StudentPass2026!"),
        full_name="Alex Mercer",
        role="student"
    )
    db.add(student)
    db.flush()

    student_profile = StudentProfile(
        user_id=student.id,
        student_id_number="MIT-2026-9042",
        department="Electrical Engineering & Computer Science",
        year_of_study=3,
        preferred_noise_level="quiet"
    )
    db.add(student_profile)

    # Secondary Student
    student2 = User(
        email="maya.lin@librava.ai",
        hashed_password=get_password_hash("StudentPass2026!"),
        full_name="Maya Lin",
        role="student"
    )
    db.add(student2)
    db.flush()
    db.add(StudentProfile(
        user_id=student2.id,
        student_id_number="MIT-2026-8812",
        department="Cognitive Robotics & AI",
        year_of_study=4,
        preferred_noise_level="silent"
    ))

    print("Seeding 4 Library Floors...")
    floors_data = [
        {"num": 0, "name": "Level 0: Nexus Grand Atrium", "desc": "Collaborative commons, interactive media hub, café study bar & reception.", "cap": 50, "noise": "collaborative", "z": 0.0},
        {"num": 1, "name": "Level 1: Silent Stacks & Deep Focus", "desc": "Strict silence research zone, book stacks, panoramic window pods.", "cap": 50, "noise": "silent", "z": 6.0},
        {"num": 2, "name": "Level 2: Cybernetic Compute & AI Lab", "desc": "High-performance workstations, dual 4K monitors, GPU compute terminals.", "cap": 50, "noise": "quiet", "z": 12.0},
        {"num": 3, "name": "Level 3: Research Archives & Dissertation Loft", "desc": "Special collections, quiet graduate cubicles, private conference pods.", "cap": 50, "noise": "silent", "z": 18.0},
    ]

    floor_objs = []
    for f in floors_data:
        floor = LibraryFloor(
            floor_number=f["num"],
            name=f["name"],
            description=f["desc"],
            total_capacity=f["cap"],
            current_occupancy=0, # will calculate from seats
            noise_level_tag=f["noise"],
            map_layer_3d_z=f["z"]
        )
        db.add(floor)
        floor_objs.append(floor)
    db.flush()

    print("Seeding Sections and 120 3D Seats...")
    sections_def = [
        # Floor 0
        (0, "Nexus Collaborative Pods", "F0-COL", "group_discussion", "collaborative", -8.0, 0.0, -4.0),
        (0, "Reception & Discovery Desk", "F0-REC", "reception", "moderate", 0.0, 0.0, 8.0),
        (0, "Quantum Café Study Lounge", "F0-CAF", "reading_lounge", "collaborative", 8.0, 0.0, -4.0),
        # Floor 1
        (1, "Deep Focus Silent Carrels", "F1-SIL", "silent", "silent", -8.0, 6.0, -4.0),
        (1, "Central Physical Stacks", "F1-STK", "quiet", "quiet", 0.0, 6.0, 0.0),
        (1, "Panoramic Window Pods", "F1-WIN", "quiet", "quiet", 8.0, 6.0, 6.0),
        # Floor 2
        (2, "AI Workstation Cluster", "F2-CMP", "computer_lab", "quiet", -8.0, 12.0, -4.0),
        (2, "Holographic Media Pods", "F2-HVR", "group_discussion", "moderate", 8.0, 12.0, -4.0),
        (2, "Algorithmic Research Lab", "F2-ALR", "computer_lab", "quiet", 0.0, 12.0, 6.0),
        # Floor 3
        (3, "Special Manuscripts Cloister", "F3-ARC", "silent", "silent", -8.0, 18.0, -4.0),
        (3, "Graduate Dissertation Desks", "F3-GRD", "silent", "silent", 0.0, 18.0, 0.0),
        (3, "Private Study Sanctuaries", "F3-SAN", "silent", "silent", 8.0, 18.0, 4.0),
    ]

    section_objs = []
    for fl_idx, sname, scode, stype, snoise, cx, cy, cz in sections_def:
        sec = LibrarySection(
            floor_id=floor_objs[fl_idx].id,
            name=sname,
            code=scode,
            section_type=stype,
            capacity=10,
            current_occupancy=0,
            noise_level=snoise,
            coordinates_3d_x=cx,
            coordinates_3d_y=cy,
            coordinates_3d_z=cz
        )
        db.add(sec)
        section_objs.append(sec)
    db.flush()

    # Create 120 seats: 10 seats per section across 12 sections
    seat_statuses_sample = [
        "available", "available", "occupied", "available", "reserved",
        "available", "occupied", "available", "available", "maintenance"
    ]

    total_occupied_seats = 0
    all_seats = []

    for s_idx, sec in enumerate(section_objs):
        fl_obj = sec.floor
        base_x = sec.coordinates_3d_x
        base_y = sec.coordinates_3d_y
        base_z = sec.coordinates_3d_z

        for i in range(10):
            # Arrange in 2 rows of 5
            row = i // 5
            col = i % 5
            seat_x = base_x + (col - 2) * 1.5
            seat_z = base_z + (row - 0.5) * 2.0
            seat_y = base_y + 0.4 # seat level slightly above floor plate

            stat = seat_statuses_sample[(s_idx * 3 + i) % len(seat_statuses_sample)]
            if stat == "occupied":
                total_occupied_seats += 1
                sec.current_occupancy += 1
                fl_obj.current_occupancy += 1

            has_mon = (fl_obj.floor_number == 2) or (col in [0, 4])
            near_win = (col == 4 or row == 1)

            seat = Seat(
                section_id=sec.id,
                floor_id=fl_obj.id,
                seat_number=f"L{fl_obj.floor_number}-{sec.code.split('-')[1]}-{i+1:02d}",
                status=stat,
                has_power_outlet=True,
                has_monitor=has_mon,
                near_window=near_win,
                x_pos=round(seat_x, 2),
                y_pos=round(seat_y, 2),
                z_pos=round(seat_z, 2)
            )
            db.add(seat)
            all_seats.append(seat)

    db.flush()

    print("Seeding Sample Reservation for Alex Mercer...")
    # Give Alex Mercer a reservation
    res_seat = all_seats[4] # Seat marked reserved
    res_seat.status = "reserved"
    now = datetime.datetime.utcnow()
    res = SeatReservation(
        seat_id=res_seat.id,
        user_id=student.id,
        start_time=now,
        end_time=now + datetime.timedelta(hours=3),
        status="active",
        check_in_time=now,
        reservation_code="RES-9042-X"
    )
    db.add(res)

    print("Seeding IoT Sensor Network...")
    sensors = [
        {"code": "IOT-GATE-001", "type": "rfid_gate", "fl": 0, "sec": 1, "status": "online", "batt": 99.4, "ip": "10.0.1.11"},
        {"code": "IOT-PIR-002", "type": "pir_motion", "fl": 0, "sec": 0, "status": "online", "batt": 94.2, "ip": "10.0.1.12"},
        {"code": "IOT-IR-101", "type": "ir_beam", "fl": 1, "sec": 3, "status": "online", "batt": 88.5, "ip": "10.0.1.21"},
        {"code": "IOT-CAM-102", "type": "camera_counter", "fl": 1, "sec": 4, "status": "online", "batt": 100.0, "ip": "10.0.1.22"},
        {"code": "IOT-PRS-201", "type": "pressure_mat", "fl": 2, "sec": 6, "status": "online", "batt": 78.9, "ip": "10.0.1.31"},
        {"code": "IOT-PIR-202", "type": "pir_motion", "fl": 2, "sec": 7, "status": "warning", "batt": 18.2, "ip": "10.0.1.32"},
        {"code": "IOT-IR-301", "type": "ir_beam", "fl": 3, "sec": 9, "status": "online", "batt": 92.0, "ip": "10.0.1.41"},
        {"code": "IOT-GATE-302", "type": "rfid_gate", "fl": 3, "sec": 10, "status": "online", "batt": 96.5, "ip": "10.0.1.42"},
    ]

    for s in sensors:
        dev = SensorDevice(
            device_code=s["code"],
            sensor_type=s["type"],
            floor_id=floor_objs[s["fl"]].id,
            section_id=section_objs[s["sec"]].id,
            status=s["status"],
            battery_level=s["batt"],
            ip_address=s["ip"],
            last_heartbeat=now
        )
        db.add(dev)
        db.flush()
        # Seed a recent event
        ev = SensorEvent(
            sensor_id=dev.id,
            event_type="heartbeat",
            raw_payload=f'{{"battery": {s["batt"]}, "rssi": -58, "status": "{s["status"]}"}}',
            timestamp=now - datetime.timedelta(minutes=2)
        )
        db.add(ev)

    print("Seeding Book Categories and Books...")
    cats = [
        {"name": "Artificial Intelligence & ML", "code": "AI", "desc": "Deep learning, reinforcement learning, transformers, generative AI."},
        {"name": "Computer Science Systems", "code": "CS", "desc": "Distributed systems, operating systems, networking, databases."},
        {"name": "Quantum Computing", "code": "QC", "desc": "Quantum algorithms, qubits, cryptography, hardware architectures."},
        {"name": "Mathematics & Optimization", "code": "MATH", "desc": "Convex optimization, linear algebra, probability, information theory."},
        {"name": "Cognitive Neuroscience", "code": "NEURO", "desc": "Biological neural circuits, memory consolidation, sensory processing."}
    ]

    cat_objs = []
    for c in cats:
        cat = BookCategory(name=c["name"], code=c["code"], description=c["desc"])
        db.add(cat)
        cat_objs.append(cat)
    db.flush()

    sample_books = [
        ("Deep Learning: Foundations and Frontiers", "Ian Goodfellow & Yoshua Bengio", "978-0262035613", 0, 8, 2, 0.94),
        ("Designing Data-Intensive Applications", "Martin Kleppmann", "978-1449373320", 1, 10, 3, 0.92),
        ("Introduction to Algorithms (4th Edition)", "Cormen, Leiserson, Rivest, Stein", "978-0262046373", 1, 12, 4, 0.89),
        ("Quantum Computation and Quantum Information", "Michael Nielsen & Isaac Chuang", "978-1107002173", 2, 6, 2, 0.82),
        ("Convex Optimization", "Stephen Boyd & Lieven Vandenberghe", "978-0521833783", 3, 7, 5, 0.64),
        ("Principles of Neural Science", "Eric R. Kandel et al.", "978-0071390118", 4, 5, 1, 0.88),
        ("Reinforcement Learning: An Introduction", "Richard S. Sutton & Andrew G. Barto", "978-0262039246", 0, 7, 2, 0.91),
        ("Pattern Recognition and Machine Learning", "Christopher M. Bishop", "978-0387310732", 0, 8, 3, 0.87),
        ("Database Systems: The Complete Book", "Hector Garcia-Molina et al.", "978-0131873254", 1, 5, 3, 0.58),
        ("High-Performance Browser Networking", "Ilya Grigorik", "978-1449344764", 1, 6, 4, 0.62),
        ("Quantum Machine Learning", "Peter Wittek", "978-0128009536", 2, 4, 1, 0.85),
        ("Probabilistic Graphical Models", "Daphne Koller & Nir Friedman", "978-0262013192", 0, 6, 2, 0.79)
    ]

    book_objs = []
    for title, author, isbn, cat_idx, total_c, avail_c, demand in sample_books:
        bk = Book(
            category_id=cat_objs[cat_idx].id,
            title=title,
            author=author,
            isbn=isbn,
            call_number=f"QA.{76 + cat_idx * 5}.{title[:3].upper()}",
            total_copies=total_c,
            available_copies=avail_c,
            borrow_count_lifetime=total_c * 4 + int(demand * 20),
            demand_score=demand,
            cover_url=f"/covers/{cat_objs[cat_idx].code.lower()}-default.jpg"
        )
        db.add(bk)
        book_objs.append(bk)
    db.flush()

    # Seed Borrowing History for Alex Mercer
    borrow = BorrowingHistory(
        book_id=book_objs[0].id,
        user_id=student.id,
        borrow_date=now - datetime.timedelta(days=5),
        due_date=now + datetime.timedelta(days=9),
        status="active"
    )
    db.add(borrow)

    print("Seeding Calendar: Exam Schedule & Holidays...")
    exam1 = ExaminationSchedule(
        exam_name="Fall Semester Midterm Examination Series",
        department="All Faculty & Engineering Disciplines",
        start_date=now - datetime.timedelta(days=2),
        end_date=now + datetime.timedelta(days=12),
        expected_footfall_multiplier=1.65
    )
    db.add(exam1)

    holiday1 = Holiday(
        name="University Innovation & Founders Day",
        holiday_date=now + datetime.timedelta(days=25),
        is_closed=False
    )
    db.add(holiday1)

    print("Seeding ML Models in Database...")
    ml_models_info = [
        ("XGBoost Occupancy Forecaster", "xgboost", "v1.2", 12.69, 16.42, 0.9533, True),
        ("Random Forest Ensemble", "random_forest", "v1.1", 15.37, 19.85, 0.9321, False),
        ("Linear Regression Baseline", "linear_regression", "v1.0", 20.44, 25.12, 0.8845, False),
        ("Random Forest Book Demand Predictor", "book_demand_rf", "v1.0", 0.003, 0.005, 0.9990, True)
    ]

    for mname, mtype, mver, mae, rmse, r2, active in ml_models_info:
        model = MLModel(
            model_name=mname,
            model_type=mtype,
            version=mver,
            file_path=f"saved_models/{mtype}.joblib",
            mae=mae,
            rmse=rmse,
            r2=r2,
            is_active=active,
            trained_at=now
        )
        db.add(model)
        db.flush()
        db.add(MLTrainingRun(
            model_id=model.id,
            algorithm=mname,
            dataset_size=6205,
            features_used=["hour", "day_of_week", "month", "is_weekend", "is_exam_period", "lag_1h", "lag_2h", "rolling_mean_3h"],
            hyperparameters={"n_estimators": 50, "max_depth": 6, "learning_rate": 0.08},
            metrics_json={"mae": mae, "rmse": rmse, "r2": r2},
            status="completed",
            duration_seconds=1.85,
            logs="Dataset split 70/15/15. Temporal cross-validation verified. Zero leakage."
        ))

    print("Seeding Notifications & Recommendations...")
    db.add(Notification(
        user_id=student.id,
        title="Active Seat Reservation Confirmed",
        message="Your seat L0-COL-05 at Nexus Collaborative Pods is confirmed until 17:30.",
        notification_type="booking_reminder"
    ))
    db.add(Notification(
        user_id=student.id,
        title="Peak Occupancy Advisory",
        message="AI predicts Level 1 will hit 92% capacity between 14:00 and 16:30 today due to midterm exams.",
        notification_type="crowd_alert"
    ))

    db.add(Recommendation(
        user_id=student.id,
        recommendation_type="seat_zone",
        target_reference="Level 3: Research Archives & Dissertation Loft",
        confidence_score=0.96,
        explanation="Matched to your preferred quiet noise profile. Currently at only 24% occupancy with 14 available window seats."
    ))

    db.commit()
    print("Database seeding completed successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()
