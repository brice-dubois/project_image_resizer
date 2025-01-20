from fastapi.testclient import TestClient
import io
from PIL import Image

def test_process_image_exposure(client, test_image):
    response = client.post(
        "/api/process-image",
        files={"image": ("test.png", test_image, "image/png")},
        data={"operation": "exposure", "params": '{"value": 0.5}'}
    )
    assert response.status_code == 200
    assert "image" in response.json()

def test_crop_image(client, test_image):
    response = client.post(
        "/api/crop",
        files={"image": ("test.png", test_image, "image/png")},
        data={"x": 0, "y": 0, "width": 50, "height": 50}
    )
    assert response.status_code == 200
