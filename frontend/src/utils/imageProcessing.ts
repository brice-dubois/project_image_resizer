// Importing the image compression library
import imageCompression from 'browser-image-compression';

// Function to compress an image file
export async function compressImage(file: File, maxWidth?: number, maxHeight?: number): Promise<File> {
  const options = {
    maxSizeMB: 1, // Maximum size of the compressed image
    maxWidthOrHeight: Math.max(maxWidth || 3500, maxHeight || 3500), // Maximum dimensions
    useWebWorker: true, // Use web workers for compression
    resolution: 300, // Set resolution to 300 DPI
  };

  try {
    return await imageCompression(file, options); // Compress the image
  } catch (error) {
    console.error('Error compressing image:', error); // Log any errors
    return file; // Return the original file if compression fails
  }
}

// Function to resize an image file
export async function resizeImage(file: File, width: number, height: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image(); // Create a new image element
    img.onload = () => {
      const canvas = document.createElement('canvas'); // Create a canvas to draw the image
      canvas.width = width; // Set canvas width
      canvas.height = height; // Set canvas height
      
      const ctx = canvas.getContext('2d'); // Get the 2D drawing context
      if (!ctx) {
        reject(new Error('Could not get canvas context')); // Reject if context is not available
        return;
      }
      
      // Set the resolution to 300 DPI
      ctx.imageSmoothingEnabled = true; // Enable image smoothing
      ctx.imageSmoothingQuality = 'high'; // Set smoothing quality
      
      ctx.drawImage(img, 0, 0, width, height); // Draw the image on the canvas
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Could not create blob')); // Reject if blob creation fails
          return;
        }
        
        // Create a new file with the same name and type
        const resizedFile = new File([blob], file.name, { type: file.type });
        
        // Compress the resized image
        const compressedFile = await compressImage(resizedFile); // Compress the resized file
        resolve(compressedFile); // Resolve with the compressed file
      }, file.type, 1.0); // Use maximum quality for the blob
    };
    
    img.onerror = () => reject(new Error('Failed to load image')); // Reject if image loading fails
    img.src = URL.createObjectURL(file); // Set the image source to the file URL
  });
}

// Function to create an object URL for a file
export function createObjectURL(file: File): string {
  return URL.createObjectURL(file); // Return the object URL
}

// Function to revoke an object URL
export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url); // Revoke the object URL to free up resources
}

// Function to format a file name
export function formatFileName(name: string, category: string, extension: string): string {
  return `${name}.${category}.${extension}`; // Return the formatted file name
}

// Function to calculate the aspect ratio
export function calculateAspectRatio(width: number, height: number): number {
  return width / height; // Return the aspect ratio
}

// Function to get new dimensions while maintaining aspect ratio
export function getDimensionsWithAspectRatio(
  currentWidth: number,
  currentHeight: number,
  newWidth?: number,
  newHeight?: number
): { width: number; height: number } {
  const aspectRatio = calculateAspectRatio(currentWidth, currentHeight); // Calculate aspect ratio

  if (newWidth && !newHeight) {
    return {
      width: newWidth,
      height: Math.round(newWidth / aspectRatio), // Calculate height based on new width
    };
  }

  if (newHeight && !newWidth) {
    return {
      width: Math.round(newHeight * aspectRatio), // Calculate width based on new height
      height: newHeight,
    };
  }

  return { width: currentWidth, height: currentHeight }; // Return current dimensions if no new dimensions are provided
}