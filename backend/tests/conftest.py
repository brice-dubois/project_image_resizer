import pytest
from fastapi.testclient import TestClient
from app.main import app
import io
from PIL import Image
import numpy as np

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def test_image():
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr
