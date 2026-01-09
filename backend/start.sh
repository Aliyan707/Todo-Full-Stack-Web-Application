#!/bin/bash
# Start script for production deployment

# Run database migrations (if any)
# python -m app.migrations

# Start the FastAPI application with uvicorn
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
