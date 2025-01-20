import cv2
import numpy as np
from PIL import Image
from .filters import (
    ExposureFilter,
    HighlightsFilter,
    ShadowsFilter,
    SharpnessFilter,
    RotateFilter,
    FlipFilter
)
from .utils import convert_to_base64, load_image
from typing import Optional
import io

class ImageProcessor:
    def __init__(self):
        self.filters = {
            'exposure': ExposureFilter(),
            'highlights': HighlightsFilter(),
            'shadows': ShadowsFilter(),
            'sharpness': SharpnessFilter(),
            'rotate': RotateFilter(),
            'flip': FlipFilter()
        }
    
    async def process(self, image_bytes: io.BytesIO, operation: str, params: dict):
        """Main processing method that routes to specific operations"""
        if operation not in self.filters:
            raise ValueError(f"Unsupported operation: {operation}")
            
        image = await load_image(image_bytes)
        filter_instance = self.filters[operation]
        processed_image = await filter_instance.apply(image, params)
        
        return await convert_to_base64(processed_image)
    
    async def crop(self, image_bytes: io.BytesIO, x: int, y: int, width: int, height: int):
        """Crop the image to specified dimensions"""
        image = Image.open(image_bytes)
        cropped = image.crop((x, y, x + width, y + height))
        return await convert_to_base64(cropped)
