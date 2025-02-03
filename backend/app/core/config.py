from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Image Processing API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "API for processing images with various filters and operations"
    API_V1_STR: str = "/api/v1"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]  # React dev server
    
    # Google Cloud settings
    GOOGLE_APPLICATION_CREDENTIALS: str
    PROJECT_ID: str
    DATASET_ID: str
    TABLE_ID: str = "user_logs"

    class Config:
        env_file = ".env"

settings = Settings()
