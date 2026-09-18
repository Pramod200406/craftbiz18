@echo off
echo Starting CRAFTBIZ AI Backend and Frontend...
python backend\seed.py
start cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"
start cmd /k "cd frontend && npm run dev -- --host"
