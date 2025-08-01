'use client'

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-console-border border-t-console-accent`} />
      {text && (
        <p className="text-console-text font-console text-sm mt-2">{text}</p>
      )}
    </div>
  )
}

export function LoadingProgress({ progress, text }: { progress: number; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-64 bg-console-darker rounded-full h-2 mb-2">
        <div 
          className="bg-console-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {text && (
        <p className="text-console-text font-console text-sm">{text}</p>
      )}
    </div>
  )
} 