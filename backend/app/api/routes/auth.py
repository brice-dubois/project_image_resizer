from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login(request: Request, login_data: LoginRequest):
    # Reference the users from LoginPage.tsx
    USERS = [
        {
            "email": "admin@example.com",
            "password": "admin123",
            "name": "Admin User",
            "role": "admin"
        },
        {
            "email": "brice.dubois@etail-agency.com",
            "password": "brice123",
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