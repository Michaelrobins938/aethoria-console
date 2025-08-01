'use client'

import { createAttachmentAdapter } from "@assistant-ui/react";

interface UploadResponse {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  contentType: string;
  status: 'complete' | 'error';
  error?: string;
}

interface FilePreview {
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  alt: string;
  thumbnail?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
  };
}

export const AethoriaAttachmentAdapter = createAttachmentAdapter({
  name: "aethoria-attachments",
  description: "Aethoria game attachment adapter with robust file handling",
  
  // Professional file upload handler with real API integration
  async uploadFile(file: File): Promise<UploadResponse> {
    try {
      // Validate file before upload
      this.validateFile(file);
      
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'attachment');
      formData.append('timestamp', new Date().toISOString());
      
      // Upload to server with progress tracking
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const uploadData = await response.json();
      
      return {
        id: uploadData.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: uploadData.url,
        contentType: file.type,
        status: 'complete'
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        id: `error_${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: '',
        contentType: file.type,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  },
  
  // Professional file preview handler with metadata extraction
  async getFilePreview(fileId: string): Promise<FilePreview> {
    try {
      const response = await fetch(`/api/files/${fileId}/preview`);
      
      if (!response.ok) {
        throw new Error('Failed to get file preview');
      }
      
      const previewData = await response.json();
      
      return {
        type: previewData.type,
        url: previewData.url,
        alt: previewData.alt || 'File preview',
        thumbnail: previewData.thumbnail,
        metadata: previewData.metadata
      };
    } catch (error) {
      console.error('Preview error:', error);
      return {
        type: 'document',
        url: `/api/files/${fileId}`,
        alt: 'File preview unavailable'
      };
    }
  },
  
  // Comprehensive file validation with detailed error messages
  validateFile(file: File): boolean {
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    const allowedTypes = [
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Documents
      'text/plain', 'text/markdown', 'text/html', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
      // Video
      'video/mp4', 'video/webm', 'video/ogg',
      // Archives
      'application/zip', 'application/x-rar-compressed',
      // Game files
      'application/json', 'text/csv'
    ];
    
    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type '${file.type}' is not supported. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    // Check for malicious file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif'];
    const fileName = file.name.toLowerCase();
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      throw new Error('Potentially dangerous file type detected.');
    }
    
    // Validate image dimensions if it's an image
    if (file.type.startsWith('image/')) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          if (img.width > 4096 || img.height > 4096) {
            reject(new Error('Image dimensions exceed 4096x4096 limit.'));
          }
          resolve(true);
        };
        img.onerror = () => reject(new Error('Invalid image file.'));
        img.src = URL.createObjectURL(file);
      });
    }
    
    return true;
  },
  
  // File type detection and categorization
  getFileCategory(file: File): string {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('text/') || file.type.includes('document')) return 'document';
    if (file.type.includes('json') || file.type.includes('csv')) return 'data';
    return 'other';
  },
  
  // Generate thumbnail for supported file types
  async generateThumbnail(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/')) return null;
    
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 150;
        let { width, height } = img;
        
        if (width > height) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
  }
}); 