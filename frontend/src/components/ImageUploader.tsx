import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface Props {
  onUpload: (files: FileList) => void;
  multiple?: boolean;
}

export function ImageUploader({ onUpload, multiple = true }: Props) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      onUpload(e.dataTransfer.files);
    },
    [onUpload]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onUpload(e.target.files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleChange}
        multiple={multiple}
        accept="image/*"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Drop images here or click to upload
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Supports JPG, PNG, GIF
        </p>
      </label>
    </div>
  );
}