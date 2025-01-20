import React, { useState } from 'react';
import { Modal } from '../components/Modal';
import { ImageEditor } from '../components/ImageEditor';
import { Upload, Clock, Image as ImageIcon} from 'lucide-react';

interface ImageHistory {
  id: string;
  url: string;
  timestamp: Date;
  name: string;
}

export function ImageEditorPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageHistory, setImageHistory] = useState<ImageHistory[]>([]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        setIsEditorOpen(true);
        
        // Add to history
        const newHistoryItem: ImageHistory = {
          id: Date.now().toString(),
          url: imageUrl,
          timestamp: new Date(),
          name: file.name
        };
        setImageHistory(prev => [newHistoryItem, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (editedImageUrl: string) => {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = editedImageUrl;
    link.download = 'edited-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsEditorOpen(false);
  };

  const handleHistoryItemClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsEditorOpen(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen p-8 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="rounded-lg bg-white dark:bg-gray-800 shadow-lg p-8 text-center">
          <div className="max-w-xl mx-auto">
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-600 border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-200/50 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-gray-400" />
                <p className="mb-2 text-sm text-gray-300">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG or GIF</p>
              </div>
              <input
                id="image-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>

        {/* History Section */}
        {imageHistory.length > 0 && (
          <div className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-300">Recent Images</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {imageHistory.map((item) => (
                <div
                  key={item.id}
                  className="group relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors bg-white dark:bg-gray-800"
                  onClick={() => handleHistoryItemClick(item.url)}
                >
                  <div className="aspect-video w-full relative">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                      <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">{item.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(item.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Modal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)}>
          {selectedImage && (
            <ImageEditor
              imageUrl={selectedImage}
              onSave={handleSave}
              onClose={() => setIsEditorOpen(false)}
            />
          )}
        </Modal>
      </div>
    </div>
  );
} 