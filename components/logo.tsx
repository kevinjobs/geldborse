"use client"

import * as React from "react"

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#32D74B" />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="4"
        width="32"
        height="32"
        rx="8"
        fill="#1E1E1E"
        stroke="#2C2C2E"
        strokeWidth="1"
      />
      <path
        d="M22 8l-8 12h6l-2 12 10-14h-6l2-10z"
        fill="url(#logoGradient)"
      />
      <circle
        cx="28"
        cy="28"
        r="2"
        fill="#32D74B"
        opacity="0.8"
      />
    </svg>
  )
}
