#!/bin/bash

# Start Django backend
gnome-terminal -- bash -c "source server/.venv/bin/activate && cd server/app && uv run python3 manage.py runserver 0.0.0.0:8000; exec bash"

# Start Celery worker 
gnome-terminal -- bash -c "source server/.venv/bin/activate && cd server/app && uv run celery -A app worker -l info; exec bash"

# Start React frontend
gnome-terminal -- bash -c "cd client && npm run dev; exec bash"

