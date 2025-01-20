import { useEffect, useRef, useState } from 'react';
import { Canvas, Image as FabricImage } from 'fabric';
import { Slider } from '../components/Slider';
import { 
  RotateCw, 
  FlipHorizontal,
  Save,
  Crop,
  Wand2,
  Layers,
  X,
  Trash2
} from 'lucide-react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onClose: () => void;
}

export function ImageEditor({ imageUrl, onSave, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [image, setImage] = useState<FabricImage | null>(null);
  
  // Image adjustment states
  const [exposure, setExposure] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [sharpness, setSharpness] = useState(0);

  // Add this state to track the current image URL
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: window.innerWidth - 350,
        height: window.innerHeight - 100,
      });
      
      setCanvas(fabricCanvas);
      setCurrentImageUrl(imageUrl); // Set initial image URL

      FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous'
      }).then((img) => {
        img.scaleToWidth(700);
        fabricCanvas.centerObject(img);
        fabricCanvas.add(img);
        setImage(img);
      });

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, [imageUrl]);

  const handleExposureChange = async (value: number) => {
    setExposure(value);
    await processImage('exposure', { value });
  };

  const handleHighlightsChange = async (value: number) => {
    setHighlights(value);
    await processImage('highlights', { value });
  };

  const handleShadowsChange = async (value: number) => {
    setShadows(value);
    await processImage('shadows', { value });
  };

  const handleSharpnessChange = async (value: number) => {
    setSharpness(value);
    await processImage('sharpness', { value });
  };

  const handleRotate = async () => {
    await processImage('rotate', { angle: 90 });
  };

  const handleFlip = async () => {
    await processImage('flip', { flipX: true });
  };

  const handleRemoveBackground = async () => {
    await processImage('remove_background', {});
  };

  const handleSave = () => {
    if (canvas) {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1
      });
      onSave(dataUrl);
    }
  };

  const processImage = async (operation: string, params: any) => {
    try {
      const formData = new FormData();
      const blob = await fetch(currentImageUrl).then(r => r.blob());
      formData.append('image', blob);
      
      const response = await fetch('http://localhost:8000/api/process-image', {
        method: 'POST',
        body: formData,
        headers: {
          'operation': operation,
          'params': JSON.stringify(params)
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error:', errorData);
        return;
      }
      
      const data = await response.json();
      if (data.image) {
        const newImageUrl = `data:image/png;base64,${data.image}`;
        setCurrentImageUrl(newImageUrl); // Update the current image URL
        
        FabricImage.fromURL(newImageUrl, {
          crossOrigin: 'anonymous'
        }).then((img: FabricImage) => {
          if (canvas) {
            canvas.clear();
            img.scaleToWidth(700);
            canvas.centerObject(img);
            canvas.add(img);
            canvas.renderAll();
          }
        });
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600" 
            title="Exit"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold">Photo Editor</h2>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tools Sidebar */}
        <div className="w-16 border-r p-2 flex flex-col gap-2">
          <button 
            className="p-3 hover:bg-gray-100 rounded-lg cursor-not-allowed opacity-50 relative group" 
            title="Coming Soon"
            disabled
          >
            <Crop size={20} />
            <span className="absolute left-16 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Crop feature coming soon!
            </span>
          </button>
          <button 
            className="p-3 hover:bg-gray-100 rounded-lg cursor-not-allowed opacity-50 relative group" 
            title="Coming Soon"
            disabled
          >
            <Wand2 size={20} />
            <span className="absolute left-16 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Magic Wand feature coming soon!
            </span>
          </button>
          <button 
            className="p-3 hover:bg-gray-100 rounded-lg cursor-not-allowed opacity-50 relative group" 
            title="Coming Soon"
            disabled
          >
            <Layers size={20} />
            <span className="absolute left-16 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ">
              Layers feature coming soon!
            </span>
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-4">
          <canvas ref={canvasRef} className="border rounded-lg shadow-sm mx-auto" />
        </div>

        {/* Adjustments Panel */}
        <div className="w-72 border-l p-4 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-600">Light</h3>
            <Slider
              label="Exposure"
              value={exposure}
              onChange={handleExposureChange}
              min={-1}
              max={1}
              step={0.1}
            />
            <Slider
              label="Highlights"
              value={highlights}
              onChange={handleHighlightsChange}
              min={-1}
              max={1}
              step={0.1}
            />
            <Slider
              label="Shadows"
              value={shadows}
              onChange={handleShadowsChange}
              min={-1}
              max={1}
              step={0.1}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-600">Detail</h3>
            <Slider
              label="Sharpness"
              value={sharpness}
              onChange={handleSharpnessChange}
              min={0}
              max={1}
              step={0.1}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-600">Transform</h3>
            <div className="flex gap-2">
              <button
                onClick={handleRotate}
                className="flex-1 p-2 border rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2"
              >
                <RotateCw size={18} />
                <span className="text-sm">Rotate</span>
              </button>
              <button
                onClick={handleFlip}
                className="flex-1 p-2 border rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2"
              >
                <FlipHorizontal size={18} />
                <span className="text-sm">Flip</span>
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRemoveBackground}
              className="flex-1 p-2 border rounded-lg bg-blue-500 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Trash2 size={18} className="text-white"/>
              <span className="text-sm text-white">Remove Background</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 