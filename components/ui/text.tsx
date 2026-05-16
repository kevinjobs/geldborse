import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const textVariants = cva("font-sans", {
  variants: {
    variant: {
      "display-xl": "text-5xl font-light tracking-tight leading-tight",
      "display-lg": "text-4xl font-light tracking-tight leading-tight",
      "display-md": "text-3xl font-light tracking-tight leading-tight",
      "heading-xl": "text-2xl font-semibold tracking-tight",
      "heading-lg": "text-xl font-semibold tracking-tight",
      "heading-md": "text-lg font-semibold tracking-tight",
      "heading-sm": "text-base font-semibold tracking-tight",
      "title-lg": "text-lg font-medium",
      "title-md": "text-base font-medium",
      "title-sm": "text-sm font-medium",
      "body-lg": "text-base leading-relaxed",
      "body-md": "text-sm leading-relaxed",
      "body-sm": "text-xs leading-relaxed",
      "body-xs": "text-[0.625rem] leading-relaxed",
      "label-lg": "text-sm font-medium uppercase tracking-wider",
      "label-md": "text-xs font-medium uppercase tracking-wider",
      "label-sm": "text-[0.625rem] font-medium uppercase tracking-wider",
      "caption": "text-xs text-muted-foreground",
      "pricing-display": "text-5.5xl font-light",
      "pricing-card-title": "text-lg font-medium",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    textColor: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      tertiary: "text-[#6B7280]",
      link: "text-link",
      primary: "text-primary",
      accent: "text-accent",
      destructive: "text-destructive",
      white: "text-white",
    },
  },
  defaultVariants: {
    variant: "body-md",
    align: "left",
    textColor: "default",
  },
})

type TextVariants = VariantProps<typeof textVariants>

interface TextProps extends Omit<React.ComponentProps<"span">, "color">, TextVariants {
  asChild?: boolean
}

function Text({
  className,
  variant = "body-md",
  align = "left",
  textColor = "default",
  asChild = false,
  ...props
}: TextProps) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      className={cn(textVariants({ variant, align, textColor, className }))}
      {...props}
    />
  )
}

export { Text, textVariants }
