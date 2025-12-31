"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative overflow-hidden rounded-xl font-medium",
    "transition-all duration-200",
    "transform hover:scale-105 active:scale-95",
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-r from-purple-700 via-purple-600 to-blue-500",
          "text-white",
          "shadow-lg shadow-purple-700/40",
          "hover:shadow-2xl hover:shadow-purple-600/60",
          "focus:ring-purple-600",
        ],
        secondary: [
          "bg-transparent border-2 border-cyan-400",
          "text-cyan-400",
          "hover:bg-cyan-400/10",
          "shadow-lg shadow-cyan-400/30",
          "hover:shadow-xl hover:shadow-cyan-400/50",
          "focus:ring-cyan-400",
        ],
        glass: [
          "bg-white/10 backdrop-blur-xl",
          "border border-white/20",
          "text-white",
          "hover:bg-white/20",
          "shadow-xl hover:shadow-2xl",
          "focus:ring-white/50",
        ],
      },
      size: {
        small: "px-4 py-2 text-sm",
        medium: "px-6 py-3 text-base",
        large: "px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "medium",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export const Button = ({
  variant,
  size,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
};
