from abc import ABC, abstractmethod
from PIL import Image, ImageEnhance
import cv2
import numpy as np

class ImageFilter(ABC):
    @abstractmethod
    async def apply(self, image: Image.Image, params: dict) -> Image.Image:
        pass

class ExposureFilter(ImageFilter):
    async def apply(self, image: Image.Image, params: dict) -> Image.Image:
        value = params.get('value', 0)
        img_array = np.array(image)
        adjusted = cv2.convertScaleAbs(img_array, alpha=1 + value, beta=0)
        return Image.fromarray(adjusted)

class HighlightsFilter(ImageFilter):
    async def apply(self, image: Image.Image, params: dict) -> Image.Image:
        value = params.get('value', 0)
        img_array = np.array(image)
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
        h, s, v = cv2.split(hsv)
        
        mask = v > 127
        v[mask] = np.clip(v[mask] * (1 + value), 0, 255)
        
        hsv = cv2.merge([h, s, v])
        adjusted = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
        return Image.fromarray(adjusted)

class ShadowsFilter(ImageFilter):
    async def apply(self, image: Image.Image, params: dict) -> Image.Image:
        value = params.get('value', 0)
        img_array = np.array(image)
        hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
        h, s, v = cv2.split(hsv)
        
        mask = v <= 127
        v[mask] = np.clip(v[mask] * (1 + value), 0, 255)
        
        hsv = cv2.merge([h, s, v])
        adjusted = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
        return Image.fromarray(adjusted)

class SharpnessFilter(ImageFilter):
    async def apply(self, image: Image.Image, params: dict) -> Image.Image:
        value = params.get('value', 0)
        enhancer = ImageEnhance.Sharpness(image)
        return enhancer.enhance(1 + value)

class RotateFilter(ImageFilter):
    async def apply(self, image: Image.Image, params: dict) -> Image.Image:
        angle = params.get('angle', 0)
        return image.rotate(angle, expand=True)

class FlipFilter(ImageFilter):
    async def apply(self, image: Image.Image, params: dict) -> Image.Image:
        flip_x = params.get('flipX', False)
        if flip_x:
            return image.transpose(Image.FLIP_LEFT_RIGHT)
        return image
