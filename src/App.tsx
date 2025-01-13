import React, { useState, useCallback } from 'react';
import { Moon, Sun, Download } from 'lucide-react';
import JSZip from 'jszip';
import { ImageUploader } from './components/ImageUploader';
import { ImagePreview } from './components/ImagePreview';
import { Modal } from './components/Modal';
import { ImageFile } from './types';
import { compressImage, createObjectURL, revokeObjectURL, formatFileName } from './utils/imageProcessing';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleUpload = useCallback(async (files: FileList) => {
    const newImages: ImageFile[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      const compressed = await compressImage(file);
      const preview = createObjectURL(compressed);
      
      // Get original dimensions
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = preview;
      });

      newImages.push({
        id: crypto.randomUUID(),
        file: compressed,
        preview,
        name: file.name.split('.').slice(0, -1).join('.'), // Remove extension from display name
        category: 'MAIN',
        dimensions: {
          width: img.width,
          height: img.height,
          originalWidth: img.width,
          originalHeight: img.height,
        },
      });
    }

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleUpdateImage = (id: string, updates: Partial<ImageFile>) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img))
    );
  };

  const handleDeleteImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleDownloadImage = async (image: ImageFile) => {
    const link = document.createElement('a');
    link.href = image.preview;
    link.download = formatFileName(image.name, image.category, image.file.type);
    link.click();
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    
    images.forEach((image) => {
      const fileName = formatFileName(image.name, image.category, image.file.type);
      zip.file(fileName, image.file);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'images.zip';
    link.click();
    URL.revokeObjectURL(link.href);
    setShowConfirmation(false);
  };

  React.useEffect(() => {
    return () => {
      images.forEach((image) => {
        revokeObjectURL(image.preview);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Image Resizer</h1>
          <div className="flex gap-4">
            {images.length > 0 && (
              <button
                onClick={() => setShowConfirmation(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Download size={20} />
                Download All
              </button>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>

        <ImageUploader onUpload={handleUpload} />

        {images.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <ImagePreview
                key={image.id}
                image={image}
                onUpdate={handleUpdateImage}
                onDelete={handleDeleteImage}
                onDownload={handleDownloadImage}
              />
            ))}
          </div>
        )}

        <Modal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
        >
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Download All Images</h2>
            <p className="mb-6">Are you sure you want to download all images as a ZIP file?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadAll}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default App;