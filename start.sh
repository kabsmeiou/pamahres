#!/bin/bash

# Ensure Redis is running (start if not already running)
brew services start redis

# Wait a moment for Redis to be ready
sleep 1

# Start Django backend
osascript -e 'tell app "Terminal" to do script "cd /Users/cerefrid/Documents/funspace/pamahres && source server/.venv/bin/activate && cd server/app && uv run python3 manage.py runserver 0.0.0.0:8000; exec bash"'

# Start Celery worker 
osascript -e 'tell app "Terminal" to do script "cd /Users/cerefrid/Documents/funspace/pamahres && source server/.venv/bin/activate && cd server/app && uv run celery -A app worker -l info; exec bash"'

# Start React frontend
osascript -e 'tell app "Terminal" to do script "cd /Users/cerefrid/Documents/funspace/pamahres/client && npm run dev; exec bash"'

