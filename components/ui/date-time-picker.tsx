"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import DatePicker from "react-datepicker"
import { format } from "date-fns"

interface DateTimePickerProps {
  value: string
  onChange: (value: string) => void
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const waitingForTimeRef = React.useRef(false)

  React.useEffect(() => { setIsMounted(true) }, [])

  const selectedDate = React.useMemo(() => {
    if (!value) return null
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }, [value])

  const displayValue = React.useMemo(() => {
    if (!value || !selectedDate) return "选择日期时间"
    return format(selectedDate, "yyyy/MM/dd HH:mm")
  }, [value, selectedDate])

  const handleChangeValue = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    const hh = String(date.getHours()).padStart(2, "0")
    const mm = String(date.getMinutes()).padStart(2, "0")
    onChange(`${y}-${m}-${d}T${hh}:${mm}`)
  }

  const handleSelect = (date: Date | null) => {
    if (!date) return
    waitingForTimeRef.current = true
    handleChangeValue(date)
  }

  const handleChange = (date: Date | null) => {
    if (!date) return
    handleChangeValue(date)
    if (waitingForTimeRef.current) {
      waitingForTimeRef.current = false
    } else {
      setOpen(false)
    }
  }

  const [theme, setTheme] = React.useState<"dark" | "light">("dark")
  React.useEffect(() => {
    const checkTheme = () => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
    }
    checkTheme()
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])
  const calendarClassName = theme === "dark" ? "react-datepicker-dark" : "react-datepicker-light"

  if (!isMounted) {
    return (
      <Button variant="outline" size="sm" className="w-full justify-between text-left font-normal h-9">
        <CalendarIcon className="h-4 w-4 shrink-0" />
        <span className="truncate">选择日期时间</span>
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between text-left font-normal h-9"
        >
          <CalendarIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{displayValue}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 min-w-[320px]" align="start" sideOffset={4}>
        <DatePicker
          showTimeSelect
          timeIntervals={1}
          timeCaption="时间"
          dateFormat="yyyy-MM-dd HH:mm"
          selected={selectedDate}
          onSelect={handleSelect}
          onChange={handleChange}
          calendarClassName={calendarClassName}
          inline
        />
      </PopoverContent>
    </Popover>
  )
}
