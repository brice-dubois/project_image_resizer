from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from app.services.image_processor import ImageProcessor
from app.schemas.image import ImageResponse, ProcessingParams
from typing import Optional
import io
import logging

router = APIRouter()

@router.post("/process-image", response_model=ImageResponse)
async def process_image(
    image: UploadFile = File(...),
    operation: str = Header(None),
    params: str = Header(None)
):
    try:
        logging.info(f"Received request - Operation: {operation}, Params: {params}")
        
        processor = ImageProcessor()
        content = await image.read()
        img_bytes = io.BytesIO(content)
        
        params_dict = {}
        if params:
            import json
            try:
                params_dict = json.loads(params)
            except json.JSONDecodeError as e:
                raise HTTPException(status_code=400, detail=f"Invalid params JSON: {str(e)}")
        
        result = await processor.process(
            img_bytes,
            operation=operation,
            params=params_dict
        )
        
        return {"image": result}
    except Exception as e:
        logging.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/crop")
async def crop_image(
    image: UploadFile = File(...),
    x: int = 0,
    y: int = 0,
    width: int = 100,
    height: int = 100
):
    processor = ImageProcessor()
    content = await image.read()
    return await processor.crop(io.BytesIO(content), x, y, width, height) 