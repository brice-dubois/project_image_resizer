import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Error compressing image:', error);
    return file;
  }
}

export function createObjectURL(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

export function formatFileName(name: string, category: string, mimeType: string): string {
  // Get the appropriate extension from the mime type
  const extension = mimeType.split('/')[1];
  
  // Remove any existing extensions from the name
  const baseName = name.split('.')[0];
  
  // Format the filename
  return `${baseName}.${category}.${extension}`;
}