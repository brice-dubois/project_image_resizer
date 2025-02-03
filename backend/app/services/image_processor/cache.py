import hashlib
from pathlib import Path
import os
from PIL import Image
import io

class ImageCache:
    def __init__(self):
        self.cache_dir = Path("cache/background_removal")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    def get_cache_key(self, image_bytes: bytes) -> str:
        return hashlib.md5(image_bytes).hexdigest()
    
    def get_cached_image(self, cache_key: str) -> Image.Image | None:
        cache_path = self.cache_dir / f"{cache_key}.png"
        if cache_path.exists():
            return Image.open(cache_path)
        return None
    
    def cache_image(self, cache_key: str, image: Image.Image):
        cache_path = self.cache_dir / f"{cache_key}.png"
        image.save(cache_path, "PNG") 