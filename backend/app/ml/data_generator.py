import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

def generate_library_occupancy_dataset(days: int = 365, base_capacity: int = 350) -> pd.DataFrame:
    """
    Generates a realistic 12-month hourly dataset for university library occupancy.
    Incorporates:
    - Diurnal rhythm (library opens 07:00, peaks around 14:00-16:00, evening peak 19:00-21:00, closes 23:00)
    - Day-of-week effects (Monday-Thursday high, Friday medium, Saturday-Sunday distinct study rhythms)
    - Midterm and Final exam spikes (+50% to +80% surge)
    - Semester breaks and holidays (dramatically reduced occupancy)
    - Floor distribution breakdown (Floor 0: Social/Atrium, Floor 1: Silent, Floor 2: Tech, Floor 3: Archives)
    """
    np.random.seed(42)
    start_date = datetime(2025, 1, 1, 7, 0, 0)
    records = []

    # Exam periods definition: Midterms in March, Finals in May, Fall Midterms in October, Finals in December
    def is_exam_season(dt):
        m, d = dt.month, dt.day
        if (m == 3 and 10 <= d <= 25) or (m == 5 and 5 <= d <= 22) or \
           (m == 10 and 12 <= d <= 26) or (m == 12 and 6 <= d <= 21):
            return 1
        return 0

    # Major holidays / campus breaks
    def is_holiday(dt):
        m, d = dt.month, dt.day
        if (m == 1 and d <= 7) or (m == 6 and d >= 15) or (m == 7) or (m == 8 and d <= 20):
            return 1 # Summer break / winter break
        if (m == 11 and 24 <= d <= 28): # Thanksgiving / Fall break
            return 1
        return 0

    total_hours = days * 17 # 07:00 to 23:00 (17 hours per day)
    current_dt = start_date

    # Hourly baseline profile (normalized curve 0.0 to 1.0)
    hourly_curve = {
        7: 0.12, 8: 0.25, 9: 0.45, 10: 0.65, 11: 0.78, 12: 0.72,
        13: 0.82, 14: 0.90, 15: 0.95, 16: 0.92, 17: 0.85, 18: 0.70,
        19: 0.84, 20: 0.88, 21: 0.75, 22: 0.48, 23: 0.20
    }

    # Day of week multiplier (Mon=0 ... Sun=6)
    dow_mult = {0: 1.0, 1: 1.05, 2: 1.02, 3: 0.98, 4: 0.80, 5: 0.65, 6: 0.75}

    for day in range(days):
        day_date = start_date + timedelta(days=day)
        exam_flag = is_exam_season(day_date)
        holiday_flag = is_holiday(day_date)
        dow = day_date.weekday()
        is_weekend = 1 if dow >= 5 else 0

        for h in range(7, 24):
            dt = datetime(day_date.year, day_date.month, day_date.day, h, 0, 0)
            
            # Base diurnal occupancy
            base_occ_ratio = hourly_curve.get(h, 0.3) * dow_mult.get(dow, 1.0)
            
            # Exam surge multiplier
            if exam_flag:
                base_occ_ratio *= 1.45
            
            # Holiday slump
            if holiday_flag:
                base_occ_ratio *= 0.25

            # Random noise (stochastic variation)
            noise = np.random.normal(0, 0.04)
            occ_ratio = np.clip(base_occ_ratio + noise, 0.05, 0.98)
            
            total_occupancy = int(round(occ_ratio * base_capacity))
            
            # Floor allocations (proportions based on typical zone usage)
            floor_0_occ = int(round(total_occupancy * 0.32)) # Atrium & Collab
            floor_1_occ = int(round(total_occupancy * 0.30)) # Silent Stacks
            floor_2_occ = int(round(total_occupancy * 0.24)) # Computer & Tech
            floor_3_occ = total_occupancy - (floor_0_occ + floor_1_occ + floor_2_occ) # Archives

            records.append({
                "timestamp": dt,
                "hour": h,
                "day_of_week": dow,
                "month": dt.month,
                "is_weekend": is_weekend,
                "is_holiday": holiday_flag,
                "is_exam_period": exam_flag,
                "base_capacity": base_capacity,
                "total_occupancy": total_occupancy,
                "occupancy_rate": round(total_occupancy / base_capacity, 4),
                "floor_0_occupancy": floor_0_occ,
                "floor_1_occupancy": floor_1_occ,
                "floor_2_occupancy": floor_2_occ,
                "floor_3_occupancy": floor_3_occ,
            })

    df = pd.DataFrame(records)
    return df

def generate_book_borrowing_dataset(num_books: int = 50, days: int = 180) -> pd.DataFrame:
    """
    Generates synthetic borrowing statistics for books to train demand prediction.
    """
    np.random.seed(101)
    records = []
    categories = ["Computer Science", "Artificial Intelligence", "Mathematics", "Quantum Physics", "Data Science", "Neuroscience"]
    
    for b_id in range(1, num_books + 1):
        cat = categories[b_id % len(categories)]
        total_copies = np.random.choice([3, 4, 5, 8, 10])
        base_popularity = np.random.uniform(0.3, 0.95)
        
        # Simulate borrowing over semesters
        for day in range(0, days, 7): # weekly aggregation
            dt = datetime(2025, 9, 1) + timedelta(days=day)
            is_exam_week = 1 if (day in range(40, 60) or day in range(100, 120)) else 0
            
            demand_multiplier = 1.0 + (0.6 if is_exam_week else 0.0)
            if cat in ["Artificial Intelligence", "Computer Science"]:
                demand_multiplier *= 1.25

            borrow_count = int(np.clip(np.random.poisson(base_popularity * 6 * demand_multiplier), 0, total_copies * 3))
            available_copies = max(0, total_copies - min(total_copies, int(borrow_count * 0.6)))
            return_frequency_days = round(float(np.random.normal(12, 3)), 1)

            records.append({
                "book_id": b_id,
                "category": cat,
                "total_copies": total_copies,
                "available_copies": available_copies,
                "borrow_count_recent": borrow_count,
                "return_frequency_days": return_frequency_days,
                "is_exam_week": is_exam_week,
                "semester_week": (day // 7) % 16 + 1,
                "demand_score": round(min(1.0, (borrow_count / (total_copies + 1)) * 0.8), 3),
                "is_high_demand": 1 if (borrow_count >= total_copies) else 0,
                "recommended_acquisition": max(0, int(borrow_count - total_copies + 2)) if borrow_count >= total_copies else 0
            })
            
    return pd.DataFrame(records)

if __name__ == "__main__":
    df_occ = generate_library_occupancy_dataset(days=365)
    print(f"Generated occupancy dataset: {df_occ.shape} rows.")
    df_books = generate_book_borrowing_dataset(num_books=50)
    print(f"Generated book demand dataset: {df_books.shape} rows.")
