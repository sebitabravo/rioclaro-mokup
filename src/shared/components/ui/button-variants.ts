import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gov-primary text-gov-white hover:bg-gov-primary/90",
        destructive:
          "bg-gov-secondary text-gov-white hover:bg-gov-secondary/90",
        outline:
          "border border-gov-accent bg-background text-foreground hover:bg-gov-accent hover:text-gov-black dark:hover:text-gov-white",
        secondary:
          "bg-gov-accent text-gov-black dark:text-gov-white hover:bg-gov-accent/80",
        ghost: "text-foreground hover:bg-gov-accent hover:text-gov-black dark:hover:text-gov-white",
        link: "text-gov-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)