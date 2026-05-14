import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg h-12 px-6 text-sm",
        secondary: "bg-secondary text-secondary-foreground border border-secondary/20 hover:bg-secondary/80 rounded-lg h-12 px-6 text-sm",
        outline: "bg-transparent text-foreground border border-input hover:bg-muted rounded-lg h-11 px-5 text-sm",
        ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-link underline-offset-4 hover:underline",
        "icon-circular": "bg-canvas text-foreground rounded-full size-10 hover:bg-muted [&_svg:not([class*='size-'])]:size-5",
        "pricing-pill": "bg-ink text-white rounded-pill h-11 px-6 text-sm",
      },
      size: {
        default: "h-7 gap-1 px-2 text-xs/relaxed rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] [&_svg:not([class*='size-'])]:size-2.5",
        sm: "h-6 gap-1 rounded-sm px-2 text-xs/relaxed [&_svg:not([class*='size-'])]:size-3",
        lg: "h-8 gap-1 rounded-md px-2.5 text-xs/relaxed [&_svg:not([class*='size-'])]:size-4",
        icon: "size-7 rounded-md [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
        "icon-sm": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-lg": "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
