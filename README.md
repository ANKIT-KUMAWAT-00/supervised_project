# LIBRΛ — Smart Library Occupancy & Resource Intelligence System

> **"The Intelligence Behind Every Study Space."**

![LIBRΛ Banner](https://img.shields.io/badge/LIBR%CE%9B-Autonomous%20Digital%20Twin-00E5FF?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-111111?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

---

## 1. Executive Overview

**LIBRΛ** is a production-grade, AI-driven Smart Library Occupancy & Resource Intelligence platform designed as a futuristic digital twin command center. It bridges real-time IoT hardware telemetry with predictive machine learning algorithms to eliminate seat search times, forecast multi-horizon space congestion, and optimize academic resource allocations.

### Key Capabilities
- **Interactive 3D Digital Twin Library**: A 4-level architectural university model rendering 120 individual seats with real-time occupancy status (`Available`, `Occupied`, `Reserved`, `Maintenance`), power outlets, 4K display monitors, and window proximity.
- **AI Multi-Horizon Forecasting Engine**: Trained on 12-month synthetic and empirical university calendar time-series data. Evaluates and benchmarks **Linear Regression**, **Random Forest**, and **XGBoost Regressors** ($R^2 = 0.9533$, $\text{MAE} = 12.69$ seats) for 30m, 1h, 3h, 6h, and 24h horizons.
- **Interactive 3D ML Training Laboratory**: An interactive 3D laboratory rendering decision trees as a 3D forest, fitted regression planes through 3D data point clouds, and live model retraining directly from the browser.
- **Smart Book Demand & Shortage Prediction**: Machine learning regression on borrowing frequencies, exam countdowns, and peer curriculum demand, generating automated replenishment orders.
- **Multi-Factor Weighted Space Recommendation**: Algorithmic scoring across crowd densities, ambient noise profiles, and study types with transparent explainability.
- **Hardware-Agnostic IoT Ingestion**: Production-ready ingestion endpoint for ESP32, doorway IR beam counters, PIR sensors, and RFID turnstiles, coupled with a full-duplex WebSocket stream (`/ws/live`).
- **Context-Aware AI Assistant**: Natural language intelligence agent querying ground-truth database and forecasting APIs in real time.

---

## 2. Visual Identity & Color Palette

Designed with a high-end scientific research and aerospace aesthetic:

| Color Role | Hex Code | Purpose |
|---|---|---|
| **Deep Midnight Navy** | `#070B18` | Primary cosmic background |
| **Dark Blue** | `#0D1428` | Elevated glass cards & floor plates |
| **Electric Cyan** | `#00E5FF` | Primary active accent, telemetry pulse, reserved status |
| **Ice Blue** | `#80F0FF` | Text highlights, secondary lighting |
| **Cyber Violet** | `#8765FF` | ML indicators, auxiliary signals |
| **Soft White** | `#EAF4FF` | Primary typography |
| **Subtle Grey** | `#8290A8` | Metadata, coordinate labels |
| **Available Green** | `#10B981` | Open seats and nominal sensor health |
| **Moderate Demand** | `#F59E0B` | Elevated traffic or maintenance alerts |
| **Critical Occupancy**| `#EF4444` | High density, occupied seats, shortage risks |

---

## 3. System Architecture & Routes

```
librava/
├── backend/
│   ├── app/
│   │   ├── api/            # 12 Modular REST & WebSocket Routers
│   │   ├── core/           # Config, Database, Security (Bcrypt/JWT), WebSockets
│   │   ├── models/         # SQLAlchemy 22+ Table Relational Schema
│   │   ├── schemas/        # Pydantic v2 Request/Response Validation
│   │   ├── ml/             # Data generator, feature engineering, models
│   │   │   ├── saved_models/  # Serialized .joblib models & telemetry JSON
│   │   └── main.py         # FastAPI application entrypoint
│   ├── tests/              # Pytest unit & integration test suite
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/         # LibraryDigitalTwin, ML3DLab, LandingScene3D
│   │   │   ├── charts/     # Heatmaps, HourlyDemand, ModelComparison
│   │   │   └── common/     # Navbar, Sidebar, StatCard, BookingModal
│   │   ├── pages/          # 18 Complete Routes
│   │   ├── services/       # Typed Axios API Client
│   │   └── context/        # AuthContext & WebSocketContext
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

### Complete Route Map
- `/`: Cinematic 3D Hero Landing Page
- `/login`: Holographic Authentication Terminal
- `/register`: Student Profile Registration
- **Student Portal**:
  - `/student`: Overview Dashboard & Active Booking Card
  - `/student/occupancy`: Floor Breakdown & Multi-Horizon Forecasts
  - `/student/library-map`: Interactive Full-Screen 3D Digital Twin with 1-Click Booking
  - `/student/reservations`: Active Bookings, Check-in/Check-out & Access Passcodes
  - `/student/books`: Academic Catalog & AI Demand Velocity
  - `/student/recommendations`: Multi-Factor Study Zone Allocations
  - `/student/assistant`: Live AI Natural Language Assistant
- **Admin Command HQ**:
  - `/admin`: Central Intelligence Dashboard
  - `/admin/occupancy`: Zone-by-Zone Seat State Override
  - `/admin/analytics`: 7-Day Density Heatmap & CSV Data Export
  - `/admin/predictions`: Residual Error Metrics & 24h Forward Curve
  - `/admin/ml-lab`: 3D Machine Learning Laboratory with Live Retraining
  - `/admin/resources`: Book Demand Forecasting & Stock Replenishment Orders
  - `/admin/sensors`: IoT Hardware Telemetry & Real-Time Pulse Injection
  - `/admin/settings`: Operational Policies, Multipliers & Auto-Expiry

---

## 4. Machine Learning Pipeline & Metrics

The ML pipeline incorporates calendar cyclical encoding, autoregressive temporal lags, and rolling statistical features:

$$X = [\text{hour}, \text{dow}, \text{month}, \sin(2\pi h/24), \cos(2\pi h/24), \text{lag}_{1h}, \text{lag}_{2h}, \text{rolling\_mean}_{3h}, \dots]$$

### Model Benchmark Results (Evaluated on Time-Split Validation/Test)

| Algorithm | Mean Absolute Error (MAE) | Root Mean Squared Error (RMSE) | Coefficient of Determination ($R^2$) | Status |
|---|---|---|---|---|
| **Linear Regression (L2 Ridge)** | $20.44$ seats | $25.12$ seats | $0.8845$ | Baseline |
| **Random Forest Regressor** | $15.37$ seats | $19.85$ seats | $0.9321$ | Candidate |
| **XGBoost Regressor (Champion)** | **$12.69$ seats** | **$16.42$ seats** | **$0.9533$** | **Deployed Champion** |

---

## 5. Quickstart & Local Setup

### Prerequisites
- Node.js $\ge 18$
- Python $\ge 3.10$

### 1. One-Click Start (Automatic Setup)
Run the automated launcher script:
```bash
./start.sh
```
This automatically sets up Python dependencies, initializes the database with 120 seats and 4 floors, trains the ML pipeline, and starts both backend (`http://localhost:8000`) and frontend (`http://localhost:5173`).

### 2. Manual Setup

#### Backend:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Seed database and train models
python -m backend.app.seed_data
python -m backend.app.ml.train_occupancy
python -m backend.app.ml.train_book_demand

# Start server
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

### 3. Docker Compose Deployment
```bash
docker compose up --build
```
Spins up PostgreSQL 16 container, FastAPI backend, and Nginx React frontend on `http://localhost:5173`.

---

## 6. Pre-Seeded Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Student** | `student@librava.ai` | `StudentPass2026!` | Student Portal, Seat Booking, 3D Twin |
| **Chief Admin** | `admin@librava.ai` | `AdminPass2026!` | Command Center, 3D ML Lab, Sensor Controls |

*(Quick demo buttons are also embedded on the login page for instant 1-click access).*

---

## 7. Testing & Verification

Run the automated backend test suite:
```bash
PYTHONPATH=. ./backend/venv/bin/pytest backend/tests/test_api.py -v
```
All 8 test suites verify:
- API health and server handshake
- JWT student & admin authentication
- Double-booking conflict prevention transactions
- Real-time 3D coordinate resolution on 120 seats
- Multi-horizon forecasting calculations
- Ground-truth AI Assistant queries

---

## 8. License
MIT License © 2026 LIBRΛ Autonomous Systems.
