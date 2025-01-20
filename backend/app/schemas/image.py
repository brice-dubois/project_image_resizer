from pydantic import BaseModel
from typing import Optional, Dict, Any

class ProcessingParams(BaseModel):
    value: Optional[float] = None
    x: Optional[int] = None
    y: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    tolerance: Optional[int] = None

class ImageResponse(BaseModel):
    image: str
    metadata: Optional[Dict[str, Any]] = None
