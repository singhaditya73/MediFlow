"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimeSelectorProps {
  onTimeChange: (seconds: number) => void
  initialDays?: number
  initialHours?: number
}

export function TimeSelector({ onTimeChange, initialDays = 30, initialHours = 0 }: TimeSelectorProps) {
  const [timeValue, setTimeValue] = useState(initialDays > 0 ? initialDays : initialHours)
  const [timeUnit, setTimeUnit] = useState<"days" | "hours">(initialDays > 0 ? "days" : "hours")

  const handleValueChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setTimeValue(numValue)
    calculateSeconds(numValue, timeUnit)
  }

  const handleUnitChange = (unit: "days" | "hours") => {
    setTimeUnit(unit)
    calculateSeconds(timeValue, unit)
  }

  const calculateSeconds = (value: number, unit: "days" | "hours") => {
    const seconds = unit === "days" ? value * 24 * 60 * 60 : value * 60 * 60
    onTimeChange(seconds)
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Label htmlFor="time-value" className="text-sm text-muted-foreground mb-1.5 block">
          Duration
        </Label>
        <Input
          id="time-value"
          type="number"
          min="1"
          value={timeValue}
          onChange={(e) => handleValueChange(e.target.value)}
          className="bg-card/50"
        />
      </div>
      <div className="w-28">
        <Label htmlFor="time-unit" className="text-sm text-muted-foreground mb-1.5 block">
          Unit
        </Label>
        <Select value={timeUnit} onValueChange={handleUnitChange}>
          <SelectTrigger id="time-unit" className="bg-card/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hours">Hours</SelectItem>
            <SelectItem value="days">Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
