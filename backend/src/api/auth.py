from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime, timedelta
import os

router = APIRouter()


class SignInRequest(BaseModel):
    email: str
    password: str


class SignUpRequest(BaseModel):
    email: str
    password: str
    name: str


class AuthResponse(BaseModel):
    success: bool
    user: Optional[dict] = None
    session: Optional[dict] = None
    error: Optional[str] = None


def format_user_response(user: dict) -> dict:
    """Format user data to match frontend expectations"""
    return {
        "id": user["id"],
        "email": user["email"],
        "displayName": user.get("name", user.get("displayName", "")),  # Map name to displayName
        "createdAt": user["created_at"],
        "updatedAt": user.get("updated_at", user["created_at"])
    }


# Simple in-memory user storage for demo purposes
users_db = {}
sessions_db = {}


@router.post("/auth/sign-in")
async def sign_in(request: SignInRequest):
    """Simple sign-in endpoint for demo purposes"""
    try:
        # Check if user exists
        user = users_db.get(request.email)
        if not user:
            # For demo: create user on-the-fly if they don't exist
            user_id = str(uuid.uuid4())
            user = {
                "id": user_id,
                "email": request.email,
                "name": request.email.split("@")[0].title(),  # Use email prefix as name
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            users_db[request.email] = user

        # For demo purposes, we accept any password
        # In a real implementation, you would hash and verify passwords

        # Create a simple session
        session_id = str(uuid.uuid4())
        session = {
            "id": session_id,
            "user_id": user["id"],
            "expires": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }

        sessions_db[session_id] = session

        return {
            "success": True,
            "user": format_user_response(user),
            "session": session,
            "access_token": session_id  # Add access_token for frontend compatibility
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Server error, please try again later"
            }
        )


@router.post("/auth/sign-up")
async def sign_up(request: SignUpRequest):
    """Simple sign-up endpoint for demo purposes"""
    try:
        # Check if user already exists
        if request.email in users_db:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "User already exists"
                }
            )

        # Create new user
        user_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        user = {
            "id": user_id,
            "email": request.email,
            "name": request.name,
            "created_at": now,
            "updated_at": now
        }

        users_db[request.email] = user

        # Create a simple session
        session_id = str(uuid.uuid4())
        session = {
            "id": session_id,
            "user_id": user_id,
            "expires": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }

        sessions_db[session_id] = session

        return {
            "success": True,
            "user": format_user_response(user),
            "session": session,
            "access_token": session_id  # Add access_token for frontend compatibility
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Server error, please try again later"
            }
        )


@router.get("/auth/session")
async def get_session():
    """Simple session check endpoint for demo purposes"""
    # In a real implementation, you would verify the session token
    # For demo, we'll return a mock user if no users exist

    if not users_db:
        # Create a default demo user
        user_id = str(uuid.uuid4())
        user_email = "demo@example.com"
        user = {
            "id": user_id,
            "email": user_email,
            "name": "Demo User",
            "created_at": datetime.utcnow().isoformat()
        }
        users_db[user_email] = user

    # Return the first user as the session
    user = next(iter(users_db.values()))

    return {
        "user": user,
        "expires": (datetime.utcnow() + timedelta(hours=1)).isoformat()
    }


@router.post("/auth/sign-out")
async def sign_out():
    """Simple sign-out endpoint for demo purposes"""
    return {"success": True}


# Aliases for frontend compatibility
@router.post("/auth/login")
async def login(request: SignInRequest):
    """Alias for sign-in endpoint (frontend compatibility)"""
    return await sign_in(request)


@router.post("/auth/register")
async def register(request: SignUpRequest):
    """Alias for sign-up endpoint (frontend compatibility)"""
    return await sign_up(request)