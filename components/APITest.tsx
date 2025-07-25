'use client'

import { useState } from 'react'

export function APITest() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  const testGamePrompts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/game-prompts')
      const data = await response.json()
      setTestResult({ gamePrompts: data })
    } catch (error) {
      setTestResult({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="console-card p-4">
      <h3 className="font-gaming text-console-accent mb-4">API Test</h3>
      <div className="space-y-2">
        <button 
          onClick={testAPI}
          disabled={loading}
          className="console-button"
        >
          {loading ? 'Testing...' : 'Test Basic API'}
        </button>
        <button 
          onClick={testGamePrompts}
          disabled={loading}
          className="console-button"
        >
          {loading ? 'Testing...' : 'Test Game Prompts'}
        </button>
      </div>
      {testResult && (
        <div className="mt-4 p-2 bg-console-dark rounded text-xs">
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
    </div>
  )
} 