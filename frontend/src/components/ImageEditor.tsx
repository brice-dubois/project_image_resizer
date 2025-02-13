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
  Trash2,
  ImageIcon,
  Loader2
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

  // Add state for dimensions
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(1);

  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const [isChangingBackground, setIsChangingBackground] = useState(false);

  // Add new state to track any processing
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      // Get container dimensions (subtract margins/padding)
      const containerWidth = window.innerWidth - 350; // Subtract sidebar widths
      const containerHeight = window.innerHeight - 100; // Subtract header height
      
      // Calculate scale to fit image within container while maintaining aspect ratio
      let scale = 1;
      if (image) {
        const widthScale = containerWidth / (image.width || 1);
        const heightScale = containerHeight / (image.height || 1);
        scale = Math.min(widthScale, heightScale, 1); // Don't scale up images
      }
      
      // Create canvas with scaled dimensions
      const fabricCanvas = new Canvas(canvasRef.current, {
        width: containerWidth,
        height: containerHeight,
      });
      
      setCanvas(fabricCanvas);
      setCurrentImageUrl(imageUrl);

      FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous'
      }).then((img) => {
        // Scale image to fit canvas
        const scaledWidth = (img.width || 0) * scale;
        const scaledHeight = (img.height || 0) * scale;
        
        img.scaleToWidth(scaledWidth);
        fabricCanvas.centerObject(img);
        fabricCanvas.add(img);
        setImage(img);
        
        // Set initial dimensions for resize inputs
        setWidth(img.width || 0);
        setHeight(img.height || 0);
        setOriginalAspectRatio((img.width || 0) / (img.height || 0));
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

  const handleWhiteBackground = async () => {
    await processImage('white_background', {});
  };

  const handleSave = () => {
    if (currentImageUrl) {
      onSave(currentImageUrl);
    }
  };

  const processImage = async (operation: string, params: any) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      const blob = await fetch(currentImageUrl).then(r => r.blob());
      formData.append('image', blob);
      
      const response = await fetch('http://localhost:8005/api/process-image', {
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
        setCurrentImageUrl(newImageUrl);
        
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
    } finally {
      setIsProcessing(false);
    }
  };

  // Add resize handler
  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    setHeight(Math.round(newWidth / originalAspectRatio));
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    setWidth(Math.round(newHeight * originalAspectRatio));
  };

  const handleResize = async () => {
    await processImage('resize', { width, height });
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

      <div className="flex flex-1 overflow-hidden relative">
        {/* Add loading overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Processing Image...
              </p>
            </div>
          </div>
        )}

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
          <div className="space-y-2">
            <button
              onClick={handleRemoveBackground}
              className="w-full p-2 border rounded-lg bg-red-500 hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Trash2 size={18} className="text-white"/>
              <span className="text-sm text-white">Remove Background</span>
            </button>
            <button
              onClick={handleWhiteBackground}
              className="w-full p-2 border rounded-lg bg-blue-500 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <ImageIcon size={18} className="text-white" />
              <span className="text-sm text-white">White Background</span>
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-600">Resize</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500">Width (px)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500">Height (px)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full px-2 py-1 border rounded"
                />
              </div>
            </div>
            <button
              onClick={handleResize}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Resize Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 