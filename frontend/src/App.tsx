import React, { useState, useCallback } from 'react';
import { Moon, Sun, Download } from 'lucide-react';
import JSZip from 'jszip';
import { ImageUploader } from './components/ImageUploader';
import { ImagePreview } from './components/ImagePreview';
import { Modal } from './components/Modal';
import { ImageFile } from './types';
import { compressImage, createObjectURL, revokeObjectURL, resizeImage } from './utils/imageProcessing';
import { ImageEditorPage } from './pages/ImageEditorPage';
import { LoginPage } from './pages/LoginPage';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentPage, setCurrentPage] = useState<'resizer' | 'editor'>('resizer');

  const handleLogin = (email: string, password: string) => {
    // In a real app, you would validate credentials with a backend
    setIsAuthenticated(true);
  };

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
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        file: compressed,
        preview,
        name: file.name.split('.').slice(0, -1).join('.'),
        extension: (file.name.split('.').pop()?.toLowerCase() || 'jpg') as 'jpg' | 'png' | 'gif',
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
      prev.map((img) => {
        if (img.id === id) {
          const updated = { ...img, ...updates };
          // If dimensions were updated, update the preview
          if (updates.dimensions) {
            revokeObjectURL(img.preview);
            resizeImage(img.file, updates.dimensions.width, updates.dimensions.height)
              .then((resizedFile) => {
                updated.file = resizedFile;
                updated.preview = createObjectURL(resizedFile);
                setImages((current) =>
                  current.map((i) => (i.id === id ? updated : i))
                );
              });
          }
          return updated;
        }
        return img;
      })
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
    const blobUrl = URL.createObjectURL(image.file);
    link.href = blobUrl;
    link.download = `${image.name}.${image.extension}`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    
    await Promise.all(images.map(async (image) => {
      const fileName = `${image.name}.${image.extension}`; // Simplified file name
      const arrayBuffer = await image.file.arrayBuffer();
      zip.file(fileName, arrayBuffer);
    }));
    
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

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <LoginPage onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-8">
              <h1 className="text-3xl font-bold">
                {currentPage === 'resizer' ? 'Image Resizer' : 'Image Editor'}
              </h1>
              <nav className="flex gap-4">
                <button
                  onClick={() => setCurrentPage('resizer')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'resizer'
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Resizer
                </button>
                <button
                  onClick={() => setCurrentPage('editor')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === 'editor'
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Editor
                </button>
              </nav>
            </div>
            <div className="flex gap-4">
              {currentPage === 'resizer' && images.length > 0 && (
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

          {currentPage === 'resizer' ? (
            <>
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
            </>
          ) : (
            <ImageEditorPage />
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
    </ThemeProvider>
  );
}

export default App;