from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import image_routes, auth
from app.middleware.logging_middleware import logging_middleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add after CORS middleware
app.middleware("http")(logging_middleware)

# Include routers
app.include_router(image_routes.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
