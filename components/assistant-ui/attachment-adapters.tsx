'use client'

// @ts-nocheck
import {
  AttachmentAdapter,
  PendingAttachment,
  CompleteAttachment,
} from "@assistant-ui/react";

// Vision-capable image adapter for sending images to AI
export class VisionImageAdapter implements AttachmentAdapter {
  accept = "image/jpeg,image/png,image/webp,image/gif";
  maxSize = 20 * 1024 * 1024; // 20MB limit for most LLMs

  async add({ file }: { file: File }): Promise<PendingAttachment> {
    // Validate file size
    if (file.size > this.maxSize) {
      throw new Error("Image size exceeds 20MB limit");
    }

    // Validate image dimensions
    try {
      const dimensions = await this.getImageDimensions(file);
      if (dimensions.width > 4096 || dimensions.height > 4096) {
        throw new Error("Image dimensions exceed 4096x4096");
      }
    } catch (error) {
      throw new Error("Invalid image file");
    }

    return {
      id: crypto.randomUUID(),
      type: "image",
      name: file.name,
      file,
      contentType: file.type,
      status: { type: "running", reason: "uploading", progress: 0 },
    };
  }

  async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    // Convert image to base64 data URL
    const base64 = await this.fileToBase64DataURL(attachment.file);

    return {
      id: attachment.id,
      type: "image",
      name: attachment.name,
      contentType: attachment.file.type,
      content: [
        {
          type: "image",
          image: base64, // data:image/jpeg;base64,... format
        },
      ],
      status: { type: "complete" },
    };
  }

  async remove(attachment: PendingAttachment): Promise<void> {
    // Cleanup if needed
  }

  private async fileToBase64DataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
}

// Document adapter for handling text files, PDFs, etc.
export class DocumentAttachmentAdapter implements AttachmentAdapter {
  accept = "text/plain,text/markdown,text/html,application/pdf,application/json";
  maxSize = 10 * 1024 * 1024; // 10MB limit

  async add({ file }: { file: File }): Promise<PendingAttachment> {
    if (file.size > this.maxSize) {
      throw new Error("Document size exceeds 10MB limit");
    }

    return {
      id: crypto.randomUUID(),
      type: "document",
      name: file.name,
      file,
      contentType: file.type,
      status: { type: "running", reason: "uploading", progress: 0 },
    };
  }

  async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    let content = "";

    if (attachment.file.type === "application/pdf") {
      // For PDFs, we'll extract basic info and convert to base64
      const base64Data = await this.fileToBase64(attachment.file);
      content = `[PDF Document: ${attachment.name}]\nSize: ${(attachment.file.size / 1024 / 1024).toFixed(2)}MB\nBase64 data available for processing.`;
    } else {
      // For text files, read the content
      content = await this.readTextFile(attachment.file);
    }

    return {
      id: attachment.id,
      type: "document",
      name: attachment.name,
      contentType: attachment.file.type,
      content: [
        {
          type: "text",
          text: content,
        },
      ],
      status: { type: "complete" },
    };
  }

  async remove(attachment: PendingAttachment): Promise<void> {
    // Cleanup if needed
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }
}

// Game-specific adapter for character sheets, maps, etc.
export class GameFileAdapter implements AttachmentAdapter {
  accept = "application/json,text/plain,image/png,image/jpeg";
  maxSize = 5 * 1024 * 1024; // 5MB limit

  async add({ file }: { file: File }): Promise<PendingAttachment> {
    if (file.size > this.maxSize) {
      throw new Error("Game file size exceeds 5MB limit");
    }

    // Validate JSON files for character sheets
    if (file.type === "application/json") {
      try {
        const content = await this.readTextFile(file);
        const parsed = JSON.parse(content);
        
        // Check if it's a valid character sheet
        if (parsed.name && parsed.abilities) {
          return {
            id: crypto.randomUUID(),
            type: "document",
            name: file.name,
            file,
            contentType: file.type,
            status: { type: "running", reason: "uploading", progress: 0 },
          };
        }
      } catch (error) {
        throw new Error("Invalid JSON file");
      }
    }

    return {
      id: crypto.randomUUID(),
      type: "document",
      name: file.name,
      file,
      contentType: file.type,
      status: { type: "running", reason: "uploading", progress: 0 },
    };
  }

  async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    let content = "";

    if (attachment.type === "document" && attachment.name.includes("character")) {
      const textContent = await this.readTextFile(attachment.file);
      const character = JSON.parse(textContent);
      
      content = `[Character Sheet: ${character.name}]
Level: ${character.level || 1}
Health: ${character.health || 100}/${character.maxHealth || 100}
Experience: ${character.experience || 0}

Abilities:
- Strength: ${character.abilities?.strength || 10}
- Dexterity: ${character.abilities?.dexterity || 10}
- Constitution: ${character.abilities?.constitution || 10}
- Intelligence: ${character.abilities?.intelligence || 10}
- Wisdom: ${character.abilities?.wisdom || 10}
- Charisma: ${character.abilities?.charisma || 10}

Skills: ${character.skills?.map((s: any) => s.name).join(', ') || 'None'}
Background: ${character.background || 'Unknown'}`;
    } else if (attachment.file.type.startsWith("image/")) {
      const base64 = await this.fileToBase64DataURL(attachment.file);
      return {
        id: attachment.id,
        type: "image",
        name: attachment.name,
        contentType: attachment.file.type,
        content: [
          {
            type: "image",
            image: base64,
          },
        ],
        status: { type: "complete" },
      };
    } else {
      content = await this.readTextFile(attachment.file);
    }

    return {
      id: attachment.id,
      type: attachment.type,
      name: attachment.name,
      contentType: attachment.file.type,
      content: [
        {
          type: "text",
          text: content,
        },
      ],
      status: { type: "complete" },
    };
  }

  async remove(attachment: PendingAttachment): Promise<void> {
    // Cleanup if needed
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async fileToBase64DataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Composite adapter that combines all our adapters
export class AethoriaAttachmentAdapter implements AttachmentAdapter {
  private imageAdapter = new VisionImageAdapter();
  private documentAdapter = new DocumentAttachmentAdapter();
  private gameAdapter = new GameFileAdapter();

  get accept() {
    return `${this.imageAdapter.accept},${this.documentAdapter.accept},${this.gameAdapter.accept}`;
  }

  async add({ file }: { file: File }): Promise<PendingAttachment> {
    // Route to appropriate adapter based on file type
    if (file.type.startsWith("image/")) {
      return this.imageAdapter.add({ file });
    } else if (file.type === "application/json" || file.name.endsWith('.json')) {
      return this.gameAdapter.add({ file });
    } else {
      return this.documentAdapter.add({ file });
    }
  }

  async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    // Route to appropriate adapter
    if (attachment.type === "image") {
      return this.imageAdapter.send(attachment);
    } else if (attachment.type === "document" && (attachment.name.includes("character") || attachment.name.includes("game"))) {
      return this.gameAdapter.send(attachment);
    } else {
      return this.documentAdapter.send(attachment);
    }
  }

  async remove(attachment: PendingAttachment): Promise<void> {
    // Route to appropriate adapter
    if (attachment.type === "image") {
      return this.imageAdapter.remove(attachment);
    } else if (attachment.type === "character-sheet" || attachment.type === "game-file" || attachment.type === "game-image") {
      return this.gameAdapter.remove(attachment);
    } else {
      return this.documentAdapter.remove(attachment);
    }
  }
} 