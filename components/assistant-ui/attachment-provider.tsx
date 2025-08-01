'use client'

import { PropsWithChildren } from "react";
import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { AethoriaAttachmentAdapter } from "./attachment-adapters";

interface AttachmentProviderProps extends PropsWithChildren {
  onMessage?: (message: any) => void;
}

export function AttachmentProvider({ children, onMessage }: AttachmentProviderProps) {
  const runtime = useLocalRuntime({
    async run({ messages, abortSignal }) {
      // This is a placeholder - the actual chat logic is handled in the thread component
      return { content: [{ type: "text", text: "Message processed" }] };
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
} 