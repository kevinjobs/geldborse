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
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="8"
        width="32"
        height="24"
        rx="4"
        fill="url(#logoGradient)"
        opacity="0.9"
      />
      <rect
        x="6"
        y="10"
        width="28"
        height="20"
        rx="3"
        fill="white"
        opacity="0.2"
      />
      <rect
        x="24"
        y="16"
        width="12"
        height="8"
        rx="2"
        fill="white"
        opacity="0.3"
      />
      <circle
        cx="30"
        cy="20"
        r="2.5"
        fill="url(#logoGradient)"
      />
      <path
        d="M12 20h8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M8 8l2.5-4h19l2.5 4"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
