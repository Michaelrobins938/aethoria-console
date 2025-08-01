'use client'

import React, { useEffect, useState } from 'react'
import { AlertCircle, X, Copy, Check } from 'lucide-react'

interface ErrorLog {
  id: string
  timestamp: Date
  message: string
  stack?: string
  type: 'error' | 'warning' | 'info'
}

export function ErrorLogger() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Capture console errors
    const originalError = console.error
    const originalWarn = console.warn
    const originalLog = console.log

    console.error = (...args) => {
      const errorLog: ErrorLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        message: args.map(arg => 
          typeof arg === 'string' ? arg : 
          arg instanceof Error ? arg.message : 
          JSON.stringify(arg)
        ).join(' '),
        stack: args.find(arg => arg instanceof Error)?.stack,
        type: 'error'
      }
      setErrors(prev => [errorLog, ...prev.slice(0, 49)]) // Keep last 50 errors
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      const errorLog: ErrorLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        message: args.map(arg => 
          typeof arg === 'string' ? arg : 
          arg instanceof Error ? arg.message : 
          JSON.stringify(arg)
        ).join(' '),
        type: 'warning'
      }
      setErrors(prev => [errorLog, ...prev.slice(0, 49)])
      originalWarn.apply(console, args)
    }

    // Capture unhandled errors
    const handleUnhandledError = (event: ErrorEvent) => {
      const errorLog: ErrorLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        message: event.message,
        stack: event.error?.stack,
        type: 'error'
      }
      setErrors(prev => [errorLog, ...prev.slice(0, 49)])
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorLog: ErrorLog = {
        id: Date.now().toString(),
        timestamp: new Date(),
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        type: 'error'
      }
      setErrors(prev => [errorLog, ...prev.slice(0, 49)])
    }

    window.addEventListener('error', handleUnhandledError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog
      window.removeEventListener('error', handleUnhandledError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const copyErrors = async () => {
    const errorText = errors.map(error => 
      `[${error.timestamp.toISOString()}] ${error.type.toUpperCase()}: ${error.message}${error.stack ? '\n' + error.stack : ''}`
    ).join('\n\n')
    
    try {
      await navigator.clipboard.writeText(errorText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy errors:', error)
    }
  }

  const clearErrors = () => {
    setErrors([])
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 p-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-colors duration-200 z-50"
        title="Show Error Logger"
      >
        <AlertCircle className="w-5 h-5" />
        {errors.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-red-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {errors.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 w-96 max-h-96 bg-console-darker border border-console-border rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-console-border bg-console-dark">
        <h3 className="text-console-accent font-console text-sm font-bold">
          Error Logger ({errors.length})
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyErrors}
            className="p-1 hover:bg-console-border rounded transition-colors duration-200"
            title="Copy all errors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={clearErrors}
            className="p-1 hover:bg-console-border rounded transition-colors duration-200 text-console-text-dim"
            title="Clear all errors"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-console-border rounded transition-colors duration-200 text-console-text-dim"
            title="Hide error logger"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="max-h-80 overflow-y-auto">
        {errors.length === 0 ? (
          <div className="p-4 text-center text-console-text-dim text-sm">
            No errors captured yet
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {errors.map((error) => (
              <div
                key={error.id}
                className={`p-3 rounded-lg text-xs font-mono ${
                  error.type === 'error' 
                    ? 'bg-red-900/20 text-red-400 border border-red-500/30' 
                    : 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold mb-1">
                      [{error.timestamp.toLocaleTimeString()}] {error.type.toUpperCase()}
                    </div>
                    <div className="text-xs break-words">{error.message}</div>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs opacity-70">Stack trace</summary>
                        <pre className="mt-1 text-xs opacity-60 whitespace-pre-wrap">{error.stack}</pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 