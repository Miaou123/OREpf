'use client'

import { useState, useEffect } from 'react'

export default function Timer() {
  const [timeRemaining, setTimeRemaining] = useState(60)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => prev > 0 ? prev - 1 : 60)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="text-center">
      <div className="text-2xl font-mono font-bold">{formatTime(timeRemaining)}</div>
      <p className="text-sm text-text-secondary mt-1">Time remaining</p>
    </div>
  )
}