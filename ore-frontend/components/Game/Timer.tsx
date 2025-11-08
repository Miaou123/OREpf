'use client'

import { useState, useEffect } from 'react'

interface TimerProps {
  initialTime?: number // in seconds
}

export default function Timer({ initialTime = 0 }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime)

  useEffect(() => {
    if (timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 text-center">
      <div className="font-mono text-2xl font-bold mb-2">
        {formatTime(timeRemaining)}
      </div>
      <div className="text-sm text-[#a0a0a0]">Time remaining</div>
    </div>
  )
}