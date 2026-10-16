#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "    LIBRΛ — SMART LIBRARY OCCUPANCY & RESOURCE INTELLIGENCE"
echo "=========================================================="

# Check if Python venv exists
if [ ! -d "backend/venv" ]; then
    echo "[+] Creating Python virtual environment..."
    python3 -m venv backend/venv
    ./backend/venv/bin/pip install --upgrade pip
    ./backend/venv/bin/pip install -r backend/requirements.txt
fi

# Run database seed and ML initial training if needed
echo "[+] Initializing Database & Machine Learning Telemetry..."
PYTHONPATH=. ./backend/venv/bin/python -m backend.app.seed_data
PYTHONPATH=. ./backend/venv/bin/python -m backend.app.ml.train_occupancy
PYTHONPATH=. ./backend/venv/bin/python -m backend.app.ml.train_book_demand

echo "[+] Starting LIBRΛ Backend Server on http://127.0.0.1:8000..."
./backend/venv/bin/uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "[+] Starting LIBRΛ Frontend on http://localhost:5173..."
cd frontend
npm run dev -- --host &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" EXIT

wait
