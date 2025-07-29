'use client'

import { AssistantModal } from '@/components/assistant-ui/assistant-modal'

export default function TestAssistantPage() {
  return (
    <div className="min-h-screen bg-console-dark flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-gaming font-bold text-glow mb-4">
          AssistantModal Test
        </h1>
        <p className="text-console-text font-console mb-8">
          Look for the chat bubble in the bottom right corner!
        </p>
        <div className="console-panel p-6">
          <h2 className="text-2xl font-gaming font-bold text-console-accent mb-4">
            Features to Test
          </h2>
          <ul className="text-console-text font-console space-y-2 text-left">
            <li>• Click the chat bubble to open the modal</li>
            <li>• Type a message and press Enter or click Send</li>
            <li>• Check if streaming responses work</li>
            <li>• Test the close button (X) in the top right</li>
            <li>• Verify the console/gaming theme styling</li>
          </ul>
        </div>
      </div>
      
      <AssistantModal 
        title="Test AI Assistant"
        description="Testing the AssistantModal component"
        placeholder="Type a test message..."
        apiEndpoint="/api/chat"
      />
    </div>
  )
} 