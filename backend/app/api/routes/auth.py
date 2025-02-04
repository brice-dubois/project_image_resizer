from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from app.core.config import settings
import time
from app.services.logging_service import LoggingService

router = APIRouter()

logging_service = LoggingService()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(request: Request, login_data: LoginRequest):
    # Store login timestamp in request state
    request.state.login_time = time.time()
    
    # Reference the users from LoginPage.tsx
    USERS = [
        {
            "email": settings.USER_EMAIL1,
            "password": settings.USER_PASSWORD1,
            "name": "Dev Etail",
            "role": "admin"
        },
        {
            "email": settings.USER_EMAIL2,
            "password": settings.USER_PASSWORD2,
            "name": "Admin User",
            "role": "admin"
        }
    ]
    
    user = next(
        (u for u in USERS if u["email"] == login_data.email and u["password"] == login_data.password),
        None
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Set user email in request state for logging
    request.state.user_email = user["email"]
    
    return {
        "email": user["email"],
        "name": user["name"],
        "role": user["role"]
    }

@router.post("/logout")
async def logout(request: Request):
    # Calculate session duration
    login_time = getattr(request.state, "login_time", None)
    if login_time:
        session_duration = time.time() - login_time
        
        # Log the logout event
        await logging_service.log_request(
            request=request,
            user_email=getattr(request.state, "user_email", "anonymous"),
            status_code=200,
            execution_time=session_duration,
            task="logout"
        )
    
    return {"message": "Logged out successfully"} 