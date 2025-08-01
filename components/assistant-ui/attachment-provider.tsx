'use client'

import { PropsWithChildren } from "react";
import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { AethoriaAttachmentAdapter } from "./attachment-adapters";
import { useGameStore } from '@/lib/store';

interface AttachmentProviderProps extends PropsWithChildren {
  onMessage?: (message: any) => void;
}

export function AttachmentProvider({ children, onMessage }: AttachmentProviderProps) {
  const { sendMessage, addMessage, isTyping, setIsTyping } = useGameStore();

  const runtime = useLocalRuntime({
    async run({ messages, abortSignal }) {
      try {
        setIsTyping(true);
        
        // Get the latest user message
        const lastMessage = messages[messages.length - 1];
        if (!lastMessage || lastMessage.role !== 'user') {
          throw new Error('No valid user message found');
        }

        // Process attachments if present
        const attachments = lastMessage.attachments || [];
        let processedContent = lastMessage.content;

        // Handle different attachment types
        for (const attachment of attachments) {
          switch (attachment.type) {
            case 'image':
              processedContent += `\n[Image: ${attachment.name}]`;
              break;
            case 'document':
              processedContent += `\n[Document: ${attachment.name}]`;
              break;
            case 'audio':
              processedContent += `\n[Audio: ${attachment.name}]`;
              break;
            case 'video':
              processedContent += `\n[Video: ${attachment.name}]`;
              break;
            default:
              processedContent += `\n[File: ${attachment.name}]`;
          }
        }

        // Send message to AI with attachments context
        const response = await sendMessage(processedContent, {
          attachments: attachments.map(att => ({
            id: att.id,
            name: att.name,
            type: att.type,
            url: att.url
          }))
        });

        // Process AI response
        if (response && response.content) {
          const aiMessage = {
            id: `ai_${Date.now()}`,
            role: 'assistant' as const,
            content: response.content,
            timestamp: new Date(),
            attachments: response.attachments || []
          };

          addMessage(aiMessage);
          onMessage?.(aiMessage);

          return {
            content: [{ 
              type: "text", 
              text: response.content 
            }]
          };
        }

        throw new Error('No response from AI');

      } catch (error) {
        console.error('Attachment provider error:', error);
        
        const errorMessage = {
          id: `error_${Date.now()}`,
          role: 'assistant' as const,
          content: `I encountered an error processing your message: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
          timestamp: new Date(),
          isError: true
        };

        addMessage(errorMessage);
        onMessage?.(errorMessage);

        return {
          content: [{ 
            type: "text", 
            text: errorMessage.content 
          }]
        };
      } finally {
        setIsTyping(false);
      }
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
} 