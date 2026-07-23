import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-heading text-sm font-bold transition-all duration-100 outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35 aria-invalid:border-destructive aria-invalid:ring-destructive/20 active:translate-y-0.5 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "border-2 border-leaf bg-leaf text-white shadow-[0_3px_0_rgba(42,51,31,0.2)] hover:bg-leaf/90 active:shadow-[0_1px_0_rgba(42,51,31,0.2)]",
        destructive:
          "border-2 border-destructive bg-destructive text-white shadow-[0_3px_0_rgba(105,0,5,0.18)] hover:bg-destructive/90 focus-visible:ring-destructive/20 active:shadow-[0_1px_0_rgba(105,0,5,0.18)] dark:focus-visible:ring-destructive/40",
        outline:
          "border-2 border-leaf/25 bg-white text-deep shadow-[0_3px_0_rgba(42,51,31,0.08)] hover:border-leaf/45 hover:bg-butter active:shadow-[0_1px_0_rgba(42,51,31,0.08)] dark:bg-card",
        secondary:
          "border-2 border-butter bg-butter text-deep shadow-[0_3px_0_rgba(42,51,31,0.1)] hover:bg-sun/35 active:shadow-[0_1px_0_rgba(42,51,31,0.1)]",
        ghost: "border-2 border-transparent text-deep hover:bg-butter",
        link: "text-leaf underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-xl px-4 text-xs has-[>svg]:px-3",
        lg: "h-13 rounded-[1.4rem] px-8 text-base has-[>svg]:px-5",
        icon: "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
