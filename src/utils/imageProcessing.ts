import imageCompression from 'browser-image-compression';

export async function compressImage(file: File, maxWidth?: number, maxHeight?: number): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: Math.max(maxWidth || 3500, maxHeight || 3500),
    useWebWorker: true,
    resolution: 300, // Set resolution to 300 DPI
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
}

export async function resizeImage(file: File, width: number, height: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Set the resolution to 300 DPI
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Could not create blob'));
          return;
        }
        
        // Create a new file with the same name and type
        const resizedFile = new File([blob], file.name, { type: file.type });
        
        // Compress the resized image
        const compressedFile = await compressImage(resizedFile);
        resolve(compressedFile);
      }, file.type, 1.0); // Use maximum quality for the blob
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

export function formatFileName(name: string, category: string, mimeType: string): string {
  const extension = mimeType.split('/')[1];
  const baseName = name.split('.')[0];
  return `${baseName}.${category}.${extension}`;
}

export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

export function getDimensionsWithAspectRatio(
  currentWidth: number,
  currentHeight: number,
  newWidth?: number,
  newHeight?: number
): { width: number; height: number } {
  const aspectRatio = calculateAspectRatio(currentWidth, currentHeight);

  if (newWidth && !newHeight) {
    return {
      width: newWidth,
      height: Math.round(newWidth / aspectRatio),
    };
  }

  if (newHeight && !newWidth) {
    return {
      width: Math.round(newHeight * aspectRatio),
      height: newHeight,
    };
  }

  return { width: currentWidth, height: currentHeight };
}