'use client'

import React from 'react'
import { Message } from '@/lib/types'
import { Dice1, Copy, Check } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MessageRendererProps {
  message: Message
  onCopy?: (content: string) => void
}

export function MessageRenderer({ message, onCopy }: MessageRendererProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      onCopy?.(content)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const renderContent = (content: string) => {
    // Simple markdown-like parsing for bold, italic, code blocks
    const lines = content.split('\n')
    
    return lines.map((line, index) => {
      // Handle code blocks
      if (line.startsWith('```')) {
        const codeBlock = lines.slice(index + 1).join('\n').split('```')[0]
        const language = line.slice(3).trim() || 'text'
        
        return (
          <div key={index} className="my-4 relative">
            <div className="flex items-center justify-between bg-console-darker p-2 rounded-t-lg border border-console-border">
              <span className="text-xs text-console-text-dim font-mono">{language}</span>
              <button
                onClick={() => handleCopy(codeBlock)}
                className="p-1 hover:bg-console-border rounded transition-colors duration-200"
                title="Copy code"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <SyntaxHighlighter
              language={language}
              style={tomorrow}
              customStyle={{
                margin: 0,
                borderRadius: '0 0 8px 8px',
                fontSize: '0.875rem',
                backgroundColor: '#1a1a1a'
              }}
            >
              {codeBlock}
            </SyntaxHighlighter>
          </div>
        )
      }
      
      // Handle inline code
      if (line.includes('`')) {
        const parts = line.split('`')
        return (
          <div key={index} className="my-1">
            {parts.map((part, partIndex) => 
              partIndex % 2 === 0 ? (
                <span key={partIndex}>{renderInlineFormatting(part)}</span>
              ) : (
                <code key={partIndex} className="bg-console-darker px-1 py-0.5 rounded text-sm font-mono">
                  {part}
                </code>
              )
            )}
          </div>
        )
      }
      
      // Handle regular text with formatting
      return (
        <div key={index} className="my-1">
          {renderInlineFormatting(line)}
        </div>
      )
    })
  }

  const renderInlineFormatting = (text: string) => {
    // Bold text with ** or __
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>')
    
    // Italic text with * or _
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
    text = text.replace(/_(.*?)_/g, '<em>$1</em>')
    
    // Convert to JSX
    const parts = text.split(/(<strong>.*?<\/strong>|<em>.*?<\/em>)/)
    
    return parts.map((part, index) => {
      if (part.startsWith('<strong>')) {
        const content = part.replace(/<\/?strong>/g, '')
        return <strong key={index} className="font-bold">{content}</strong>
      }
      if (part.startsWith('<em>')) {
        const content = part.replace(/<\/?em>/g, '')
        return <em key={index} className="italic">{content}</em>
      }
      return <span key={index}>{part}</span>
    })
  }

  const content = typeof message.content === 'string' ? message.content : 'Message content'

  return (
    <div className="message-renderer">
      {/* Main content */}
      <div className="prose prose-invert max-w-none">
        {renderContent(content)}
      </div>
      
      {/* Dice Rolls */}
      {message.diceRolls && message.diceRolls.length > 0 && (
        <div className="mt-3 pt-3 border-t border-console-border/30">
          <div className="flex items-center space-x-2 text-xs mb-2">
            <Dice1 className="w-3 h-3 text-console-accent" />
            <span className="text-console-text-dim font-medium">Dice Rolls</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {message.diceRolls.map((roll, index) => (
              <div
                key={index}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
                  roll.success 
                    ? 'bg-green-900/20 text-green-400 border-green-500/30' 
                    : 'bg-red-900/20 text-red-400 border-red-500/30'
                }`}
              >
                <div className="font-bold">{roll.type}</div>
                <div className="text-lg">{roll.result}</div>
                <div className={`text-xs ${roll.success ? 'text-green-300' : 'text-red-300'}`}>
                  {roll.success ? 'SUCCESS' : 'FAILURE'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Timestamp */}
      <div className="text-xs text-console-text-dim mt-3 opacity-60">
        {message.timestamp.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  )
} 