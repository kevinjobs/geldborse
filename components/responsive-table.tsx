"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveTableProps extends React.ComponentProps<"table"> {
  children: React.ReactNode
  className?: string
}

interface ResponsiveTableRowProps extends React.ComponentProps<"tr"> {
  children: React.ReactNode
  className?: string
}

interface ResponsiveTableHeaderProps extends React.ComponentProps<"th"> {
  children: React.ReactNode
  className?: string
  mobileLabel?: string
}

interface ResponsiveTableCellProps extends React.ComponentProps<"td"> {
  children?: React.ReactNode
  className?: string
  mobileLabel?: string
}

function ResponsiveTable({ className, ...props }: ResponsiveTableProps) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-xs", className)}
        {...props}
      />
    </div>
  )
}

function ResponsiveTableHeader({ className, mobileLabel, ...props }: ResponsiveTableHeaderProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function ResponsiveTableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function ResponsiveTableRow({ className, children, ...props }: ResponsiveTableRowProps) {
  const rowClassName = cn(
    "border-b border-[#2C2C2E] transition-colors hover:bg-[#252525] data-[state=selected]:bg-[#252525]",
    className
  )
  return (
    <tr
      data-slot="table-row"
      className={rowClassName}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<ResponsiveTableCellProps>(child)) {
          return React.cloneElement(child, { key: index })
        }
        return child
      })}
    </tr>
  )
}

function ResponsiveTableCell({ className, children, mobileLabel, ...props }: ResponsiveTableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    >
      <div className="md:hidden flex justify-between items-center">
        <span className="font-medium text-xs text-muted-foreground">{mobileLabel}</span>
        <span>{children || ''}</span>
      </div>
      <div className="hidden md:block">{children || ''}</div>
    </td>
  )
}

export {
  ResponsiveTable,
  ResponsiveTableBody,
  ResponsiveTableHeader,
  ResponsiveTableRow,
  ResponsiveTableCell,
}
