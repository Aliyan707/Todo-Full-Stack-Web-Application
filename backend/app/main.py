"""
FastAPI application entry point for Phase II Todo App backend.

This module sets up:
- FastAPI application instance
- CORS middleware for frontend communication
- Database initialization on startup
- Health check endpoint
- API route registration
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.database import init_db, test_connection

# Load environment variables from .env file
load_dotenv()

# Get CORS origins from environment
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Handles startup and shutdown events:
    - Startup: Initialize database tables
    - Shutdown: Cleanup resources (if needed)
    """
    # Startup: Initialize database
    print("[STARTUP] Starting Todo App Backend...")
    print("[STARTUP] Database initialization...")
    init_db()
    print("[READY] Backend ready!")
    print(f"[CORS] Enabled for origins: {ALLOWED_ORIGINS}")

    yield

    # Shutdown (cleanup if needed)
    print("[SHUTDOWN] Shutting down backend...")


# Create FastAPI application
app = FastAPI(
    title="Todo App API",
    description="Phase II Todo Application - Backend API with JWT authentication",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI at /docs
    redoc_url="/redoc",  # ReDoc at /redoc
    lifespan=lifespan,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Origins allowed to make requests
    allow_credentials=True,  # Allow cookies/auth headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint.

    Returns the health status of the backend and database connection.

    Returns:
        dict: Health status with database connection info
    """
    db_status = test_connection()
    return {
        "status": "healthy",
        "service": "todo-app-backend",
        "version": "1.0.0",
        "database": db_status,
    }


@app.get("/", tags=["Root"])
def read_root():
    """
    Root endpoint.

    Returns basic API information.
    """
    return {
        "message": "Todo App Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


# API Route Registration
from app.routes import auth, tasks

# Authentication routes
app.include_router(auth.router)

# Task CRUD routes
app.include_router(tasks.router)


if __name__ == "__main__":
    import uvicorn

    # Run the application
    # Note: In production, use a proper ASGI server like uvicorn with gunicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True,  # Auto-reload on code changes (development only)
    )
