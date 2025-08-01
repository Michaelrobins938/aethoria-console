import { createAttachmentAdapter } from "@assistant-ui/react";

export const AethoriaAttachmentAdapter = createAttachmentAdapter({
  name: "aethoria-attachments",
  description: "Aethoria game attachment adapter",
  
  // File upload handler
  async uploadFile(file) {
    // For now, just return a placeholder
    return {
      id: `file_${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    };
  },
  
  // File preview handler
  async getFilePreview(fileId) {
    // Return a simple preview
    return {
      type: "image",
      url: `/api/files/${fileId}`,
      alt: "File preview"
    };
  },
  
  // Validate file uploads
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/pdf'
    ];
    
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 10MB.');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported.');
    }
    
    return true;
  }
}); 