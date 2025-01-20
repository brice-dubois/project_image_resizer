from PIL import Image
import base64
import io
import numpy as np
import cv2

async def convert_to_base64(image: Image.Image) -> str:
    """Convert PIL Image to base64 string"""
    buffered = io.BytesIO()
    image.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return img_str

async def load_image(image_bytes: io.BytesIO) -> Image.Image:
    """Load image from bytes into PIL Image"""
    return Image.open(image_bytes).convert('RGB')

async def pil_to_cv2(image: Image.Image) -> np.ndarray:
    """Convert PIL Image to CV2 format"""
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

async def cv2_to_pil(image: np.ndarray) -> Image.Image:
    """Convert CV2 image to PIL format"""
    return Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
