from abc import ABC, abstractmethod
from PIL import Image, ImageEnhance
import cv2
import numpy as np
import io
from rembg import remove
from .cache import ImageCache

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

class RemoveBackgroundFilter(ImageFilter):
    def __init__(self):
        self.cache = ImageCache()
        self.session = None
        try:
            from rembg import new_session
            self.session = new_session(model_name="u2net_human_seg")
        except Exception as e:
            print(f"Failed to initialize GPU session: {e}")

    async def apply(self, image: Image.Image, params: dict) -> Image.Image:
        # Convert image to bytes for caching
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_bytes = img_byte_arr.getvalue()
        
        # Check cache
        cache_key = self.cache.get_cache_key(img_bytes)
        cached_image = self.cache.get_cached_image(cache_key)
        if cached_image:
            return cached_image

        # Process image if not cached
        max_size = 1500
        orig_size = image.size
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        if self.session:
            output = remove(img_bytes, session=self.session)
        else:
            output = remove(img_bytes)
        
        result = Image.open(io.BytesIO(output))
        
        if max(image.size) > max_size:
            result = result.resize(orig_size, Image.Resampling.LANCZOS)
        
        # Cache the result
        self.cache.cache_image(cache_key, result)
        
        return result

class ResizeFilter(ImageFilter):
    async def apply(self, image: Image.Image, params: dict) -> Image.Image:
        width = params.get('width', image.width)
        height = params.get('height', image.height)
        
        # Calculate new dimensions maintaining aspect ratio
        aspect_ratio = image.width / image.height
        if width / height > aspect_ratio:
            width = int(height * aspect_ratio)
        else:
            height = int(width / aspect_ratio)
            
        # Set DPI to 300
        dpi = (300, 300)
        
        # Resize image with high-quality resampling
        resized = image.resize((width, height), Image.Resampling.LANCZOS)
        resized.info['dpi'] = dpi
        
        # Optimize file size
        buffer = io.BytesIO()
        
        # Try different quality settings until file size is < 1MB
        quality = 95
        while quality > 50:  # Don't go below quality of 50
            buffer.seek(0)
            buffer.truncate()
            resized.save(buffer, 
                        format='PNG', 
                        optimize=True, 
                        quality=quality)
            if buffer.tell() < 1024 * 1024:  # Less than 1MB
                break
            quality -= 5
        
        buffer.seek(0)
        optimized = Image.open(buffer)
        optimized.info['dpi'] = dpi
        
        return optimized
