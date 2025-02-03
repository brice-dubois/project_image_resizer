# Image Resizer Pro

A professional image processing application that offers advanced editing capabilities including background removal, exposure adjustments, and high-quality resizing. Built with React, TypeScript, FastAPI, and Python.

## Features

- 🖼️ Advanced image editing capabilities:
  - Resize with aspect ratio maintenance
  - Background removal
  - Exposure adjustment
  - Highlights and shadows control
  - Sharpness enhancement
  - Rotation and flipping
- 🎯 Professional output:
  - 300 DPI resolution
  - Automatic file size optimization (<1MB)
  - High-quality image processing
- 🎨 Modern interface:
  - Real-time preview
  - Intuitive controls
  - Responsive design

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Fabric.js
- Vite

### Backend
- FastAPI
- Python 3.11+
- Pillow
- OpenCV
- rembg

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 16+
- Docker (optional)

### Installation

1. Clone the repository
- bash
- git clone https://github.com/brice-dubois/image_resizer
- cd image_resizer

2. Backend Setup
- bash
- cd backend
- python -m venv venv
- source venv/bin/activate  # On Windows: venv\Scripts\activate
- pip install -r requirements.txt

3. Frontend Setup
- bash
- cd frontend
- npm install

### Running the Application

#### Development Mode

1. Start the backend:
- bash
- cd backend
- uvicorn app.main:app --reload

2. Start the frontend:
- bash
- cd frontend
- npm run dev

#### Using Docker
- bash
- docker build -t image-resizer .
- docker run -p 8005:8005 image-resizer

## Project Structure
```
project/
├── backend/
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Core configurations
│   │   ├── services/    # Business logic
│   │   └── schemas/     # Data models
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   └── pages/       # Page components
│   └── public/
└── docs/                # Documentation
```

## API Documentation

Full API documentation is available at `http://localhost:8005/docs` when running the application.

## Usage

1. **Upload Image**: 
   - Click to select or drag and drop an image
   - Supports JPG, PNG formats

2. **Edit Image**:
   - Adjust exposure, highlights, and shadows
   - Remove background
   - Rotate and flip
   - Resize with maintained aspect ratio

3. **Save Changes**:
   - All changes are processed server-side
   - Images are automatically optimized
   - Download processed image

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) for the powerful backend framework
- [Fabric.js](http://fabricjs.com/) for canvas manipulation
- [rembg](https://github.com/danielgatis/rembg) for background removal
- [Lucide Icons](https://lucide.dev/) for the beautiful icons