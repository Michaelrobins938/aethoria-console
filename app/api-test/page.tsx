'use client'

import { useState } from 'react'

export default function APITestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hello, this is a test message' }],
          gamePrompt: { title: 'Test Game', genre: 'fantasy' }
        })
      })

      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-console-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-console-accent font-console text-3xl mb-8">API Test Page</h1>
        
        <button 
          onClick={testAPI}
          disabled={loading}
          className="console-button mb-8"
        >
          {loading ? 'Testing...' : 'Test Chat API'}
        </button>

        {result && (
          <div className="bg-console-darker border border-console-border rounded-lg p-6">
            <h2 className="text-console-accent font-console text-xl mb-4">API Response:</h2>
            <pre className="text-console-text font-mono text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
} 