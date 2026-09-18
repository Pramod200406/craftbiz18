#!/bin/bash
echo "?? Starting CRAFTBIZ AI (SIH 2026)..."
python backend/seed.py
(cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000) &
(cd frontend && npm run dev -- --host) &
wait
