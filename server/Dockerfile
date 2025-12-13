FROM python:3.12-slim AS base

# do not write allow python to write .pyc files
# make sure logs are sen straight to terminal without buffering(delay)
ENV PYTHONDONTWRITEBYTECODE=1 
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && apt-get clean

RUN pip install uv

COPY pyproject.toml uv.lock* ./

RUN uv sync --frozen

# copying everything in server/app/, making it in app/ directory in the container along with .toml and .lock
COPY app/ ./ 

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "app.wsgi:application", "--bind", "0.0.0.0:8000"]