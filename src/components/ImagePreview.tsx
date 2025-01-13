import React, { useState } from 'react';
import { X, Download, RotateCcw } from 'lucide-react';
import { ImageFile, Category } from '../types';
import { Modal } from './Modal';

interface Props {
  image: ImageFile;
  onUpdate: (id: string, updates: Partial<ImageFile>) => void;
  onDelete: (id: string) => void;
  onDownload: (image: ImageFile) => void;
}

const categories: Category[] = ['MAIN', 'PT01', 'PT02', 'PT03', 'PT04', 'PT05', 'PT06', 'PT07', 'OTHER'];

export function ImagePreview({ image, onUpdate, onDelete, onDownload }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [width, setWidth] = useState(image.dimensions.width);
  const [height, setHeight] = useState(image.dimensions.height);

  const handleResize = () => {
    onUpdate(image.id, {
      dimensions: {
        ...image.dimensions,
        width,
        height,
      },
    });
  };

  const handleReset = () => {
    setWidth(image.dimensions.originalWidth);
    setHeight(image.dimensions.originalHeight);
    onUpdate(image.id, {
      dimensions: {
        ...image.dimensions,
        width: image.dimensions.originalWidth,
        height: image.dimensions.originalHeight,
      },
    });
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
            onChange={(e) => onUpdate(image.id, { category: e.target.value })}
            className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <button
            onClick={() => onDownload(image)}
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
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Width</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min="100"
                max="2000"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min="100"
                max="2000"
                className="w-full px-3 py-2 border rounded"
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
      </Modal>
    </>
  );
}