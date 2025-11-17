"use client"

import { useEffect, useState } from "react"
import { Clock, Shield } from "lucide-react"

interface CountdownTimerProps {
  expiresAt: string | number | null
  onExpire?: () => void
  className?: string
  showBlockchainIcon?: boolean
}

export function CountdownTimer({ expiresAt, onExpire, className = "", showBlockchainIcon = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    expired: boolean
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false })

  useEffect(() => {
    if (!expiresAt) return

    const calculateTimeLeft = () => {
      let expiryTime: number

      // Handle both timestamp (seconds) and ISO string
      if (typeof expiresAt === "number") {
        expiryTime = expiresAt * 1000 // Convert seconds to milliseconds
      } else {
        expiryTime = new Date(expiresAt).getTime()
      }

      const now = Date.now()
      const difference = expiryTime - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
        if (onExpire) {
          onExpire()
        }
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds, expired: false })
    }

    // Calculate immediately
    calculateTimeLeft()

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpire])

  if (!expiresAt) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Clock className="w-4 h-4 text-green-500" />
        <span className="text-green-600 dark:text-green-400 font-medium">Never expires</span>
        {showBlockchainIcon && (
          <span title="Enforced on blockchain">
            <Shield className="w-3 h-3 text-blue-500" />
          </span>
        )}
      </div>
    )
  }

  if (timeLeft.expired) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <Clock className="w-4 h-4 text-red-500" />
        <span className="text-red-600 dark:text-red-400 font-medium">Expired</span>
        {showBlockchainIcon && (
          <span title="Access revoked on blockchain">
            <Shield className="w-3 h-3 text-red-500" />
          </span>
        )}
      </div>
    )
  }

  // Determine color based on time left
  const getTotalHours = () => timeLeft.days * 24 + timeLeft.hours
  const totalHours = getTotalHours()
  
  let colorClass = "text-green-600 dark:text-green-400" // > 24 hours
  let iconColor = "text-green-500"
  
  if (totalHours <= 24 && totalHours > 6) {
    colorClass = "text-orange-600 dark:text-orange-400" // 6-24 hours
    iconColor = "text-orange-500"
  } else if (totalHours <= 6) {
    colorClass = "text-red-600 dark:text-red-400" // < 6 hours
    iconColor = "text-red-500"
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Clock className={`w-4 h-4 ${iconColor}`} />
      <span className={`font-mono font-medium ${colorClass}`}>
        {timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, "0")}:
        {String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </span>
      {showBlockchainIcon && (
        <span title="Time enforced on blockchain">
          <Shield className="w-3 h-3 text-blue-500" />
        </span>
      )}
    </div>
  )
}
