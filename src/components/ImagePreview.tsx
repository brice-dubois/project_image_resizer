import React, { useState } from 'react';
import { X, Download, RotateCcw, Lock, Unlock } from 'lucide-react';
import { ImageFile, Category } from '../types';
import { Modal } from './Modal';
import { getDimensionsWithAspectRatio } from '../utils/imageProcessing';

interface Props {
  image: ImageFile;
  onUpdate: (id: string, updates: Partial<ImageFile>) => void;
  onDelete: (id: string) => void;
  onDownload: (image: ImageFile) => void;
}

const categories: Category[] = ['MAIN', 'PT01', 'PT02', 'PT03', 'PT04', 'PT05', 'PT06', 'PT07', 'OTHER'];


export function ImagePreview({ image, onUpdate, onDelete }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [width, setWidth] = useState(image.dimensions.width);
  const [height, setHeight] = useState(image.dimensions.height);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const handleResize = () => {
    onUpdate(image.id, {
      dimensions: {
        ...image.dimensions,
        width,
        height,
      },
    });
    setIsModalOpen(false);
  };

  const handleReset = () => {
    const originalWidth = image.dimensions.originalWidth;
    const originalHeight = image.dimensions.originalHeight;
    setWidth(originalWidth);
    setHeight(originalHeight);
    onUpdate(image.id, {
      dimensions: {
        ...image.dimensions,
        width: originalWidth,
        height: originalHeight,
      },
    });
  };

  const handleWidthChange = (newWidth: number) => {
    if (maintainAspectRatio) {
      const { width: w, height: h } = getDimensionsWithAspectRatio(
        image.dimensions.originalWidth,
        image.dimensions.originalHeight,
        newWidth
      );
      setWidth(w);
      setHeight(h);
    } else {
      setWidth(newWidth);
    }
  };

  const handleHeightChange = (newHeight: number) => {
    if (maintainAspectRatio) {
      const { width: w, height: h } = getDimensionsWithAspectRatio(
        image.dimensions.originalWidth,
        image.dimensions.originalHeight,
        undefined,
        newHeight
      );
      setWidth(w);
      setHeight(h);
    } else {
      setHeight(newHeight);
    }
  };

  // Update local state when image dimensions change
  React.useEffect(() => {
    setWidth(image.dimensions.width);
    setHeight(image.dimensions.height);
  }, [image.dimensions.width, image.dimensions.height]);

  const handleDownload = () => {
    const imgElement = new Image();
    imgElement.src = image.preview;
    imgElement.onload = () => {
      const resizedDataUrl = resizeImage(imgElement, width, height);
      const link = document.createElement('a');
      link.href = resizedDataUrl;
      link.download = `${image.name}.${image.category}.jpg`; // or .png
      link.click();
    };
  };

  const resizeImage = (image: HTMLImageElement, width: number, height: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(image, 0, 0, width, height);
    }
    return canvas.toDataURL('image/jpg'); // or 'image/png'
  };

  return (
    <>
      <div className="relative group bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <button
          onClick={() => onDelete(image.id)}
          className="absolute -right-2 -top-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
        
        <div
          className="cursor-pointer mb-3"
          onClick={() => setIsModalOpen(true)}
        >
          <img
            src={image.preview}
            alt={image.name}
            className="w-full h-48 object-cover rounded"
          />
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Original size:</span>
              <span>{`${image.dimensions.originalWidth} × ${image.dimensions.originalHeight}px`}</span>
            </div>
            <div className="flex justify-between">
              <span>Current size:</span>
              <span>{`${image.dimensions.width} × ${image.dimensions.height}px`}</span>
            </div>
            <div className="flex justify-between">
              <span>File size:</span>
              <span>{(image.file.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={image.name}
            onChange={(e) => onUpdate(image.id, { name: e.target.value })}
            className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
          />

          <select
            value={image.category}
            onChange={(e) => onUpdate(image.id, { category: e.target.value as Category })}
            className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={handleDownload}
            className="w-full px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-4">
          <img
            src={image.preview}
            alt={image.name}
            className="max-w-full max-h-[70vh] object-contain"
          />
          
          <div className="space-y-4">
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400"
              >
                {maintainAspectRatio ? <Lock size={16} /> : <Unlock size={16} />}
                {maintainAspectRatio ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  min="100"
                  max="3500"
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  min="100"
                  max="3500"
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={handleResize}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}