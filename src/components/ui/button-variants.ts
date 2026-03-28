import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-mono text-sm tracking-wider uppercase whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive text-white hover:bg-destructive/80 focus-visible:ring-destructive/50",
        warning:
          "bg-warning text-warning-foreground hover:bg-warning/80 focus-visible:ring-warning/50",
        info:
          "bg-info text-info-foreground hover:bg-info/80 focus-visible:ring-info/50",
        link: "text-primary underline-offset-4 hover:underline",
        landing:
          "bg-white text-black hover:bg-neutral-200 focus-visible:ring-white/50",
      },
      size: {
        default: "h-10 gap-2 px-6 text-xs",
        xs: "h-7 gap-1 px-3 text-[10px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-4 text-[11px] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-8 text-xs",
        xl: "h-12 gap-2 px-10 text-sm",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
