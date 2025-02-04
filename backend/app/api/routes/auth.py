from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from app.core.config import settings
router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(request: Request, login_data: LoginRequest):
    # Reference the users from LoginPage.tsx
    USERS = [
        {
            "email": settings.USER_EMAIL1,
            "password": settings.USER_PASSWORD1,
            "name": "Admin User",
            "role": "admin"
        },
        {
            "email": settings.USER_EMAIL2,
            "password": settings.USER_PASSWORD2,
            "name": "Brice Dubois",
            "role": "user"
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