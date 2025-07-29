'use client'

import React from 'react'
import { Loader2, Gamepad2, Cpu, Zap } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'console' | 'gaming'
}

export function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md', 
  variant = 'console' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'console':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} border-2 border-console-border rounded-full`}>
              <div className="absolute inset-0 border-2 border-console-accent rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Cpu className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'} text-console-accent animate-pulse`} />
            </div>
          </div>
        )
      
      case 'gaming':
        return (
          <div className="relative">
            <div className={`${sizeClasses[size]} border-2 border-console-border rounded-full`}>
              <div className="absolute inset-0 border-2 border-console-accent rounded-full animate-spin border-t-transparent"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Gamepad2 className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'} text-console-accent animate-pulse`} />
            </div>
          </div>
        )
      
      default:
        return (
          <Loader2 className={`${sizeClasses[size]} text-console-accent animate-spin`} />
        )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderSpinner()}
      <div className="text-center">
        <p className={`font-console text-console-text-dim ${textSizes[size]} animate-pulse`}>
          {message}
        </p>
        {variant === 'console' && (
          <div className="flex justify-center space-x-1 mt-2">
            <div className="w-1 h-1 bg-console-accent rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-console-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-console-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>
    </div>
  )
}

// Full screen loading overlay
export function LoadingOverlay({ 
  message = 'Loading...', 
  variant = 'console' 
}: Omit<LoadingSpinnerProps, 'size'>) {
  return (
    <div className="fixed inset-0 bg-console-dark/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="console-panel text-center max-w-md">
        <LoadingSpinner message={message} size="lg" variant={variant} />
      </div>
    </div>
  )
}

// Inline loading with text
export function LoadingText({ 
  message = 'Loading...', 
  variant = 'console' 
}: Omit<LoadingSpinnerProps, 'size'>) {
  return (
    <div className="flex items-center space-x-3">
      <LoadingSpinner message="" size="sm" variant={variant} />
      <span className="font-console text-console-text-dim animate-pulse">{message}</span>
    </div>
  )
} 