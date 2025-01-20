export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  category: string;
  extension: 'jpg' | 'png' | 'gif';
  dimensions: {
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
  };
}

export type Category = 'MAIN' | 'PT01' | 'PT02' | 'PT03' | 'PT04' | 'PT05' | 'PT06' | 'PT07' | 'OTHER';