'use client'

import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

export default function TestTooltipPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tooltip Test Page</h1>
      
      <div className="space-y-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me for tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This is a test tooltip</p>
          </TooltipContent>
        </Tooltip>
        
        <div>
          <p>If you can see this page and the tooltip works, the provider is working correctly.</p>
        </div>
      </div>
    </div>
  )
} 