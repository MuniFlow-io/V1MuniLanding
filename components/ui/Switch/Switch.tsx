"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const switchVariants = cva(
  [
    "group relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full",
    "transition-all duration-300 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "shadow-inner",
  ],
  {
    variants: {
      variant: {
        solid: [
          "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-600 data-[state=checked]:to-indigo-600",
          "data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-700",
          "data-[state=checked]:shadow-lg data-[state=checked]:shadow-blue-500/30",
        ],
        glass: [
          "backdrop-blur-xl border-2",
          "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500/40 data-[state=checked]:to-indigo-500/40",
          "data-[state=checked]:border-blue-400/50",
          "data-[state=checked]:shadow-xl data-[state=checked]:shadow-blue-500/40",
          "data-[state=unchecked]:bg-white/20 dark:data-[state=unchecked]:bg-black/20",
          "data-[state=unchecked]:border-white/30 dark:data-[state=unchecked]:border-white/20",
          "data-[state=unchecked]:shadow-lg",
        ],
      },
    },
    defaultVariants: {
      variant: "solid",
    },
  }
);

const thumbVariants = cva(
  [
    "pointer-events-none block h-6 w-6 rounded-full",
    "shadow-xl",
    "transition-all duration-300 ease-out",
    "data-[state=checked]:translate-x-7",
    "data-[state=unchecked]:translate-x-1",
  ],
  {
    variants: {
      variant: {
        solid: [
          "bg-white",
          "data-[state=checked]:shadow-[0_0_12px_rgba(59,130,246,0.6)]",
          "data-[state=checked]:scale-110",
        ],
        glass: [
          "bg-white dark:bg-white",
          "backdrop-blur-sm",
          "border border-white/40",
          "data-[state=checked]:shadow-[0_0_20px_rgba(96,165,250,0.8)]",
          "data-[state=checked]:border-blue-300",
          "data-[state=checked]:scale-110",
          "data-[state=unchecked]:border-gray-300",
        ],
      },
    },
    defaultVariants: {
      variant: "solid",
    },
  }
);

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

export const Switch = ({ variant, className, ...props }: SwitchProps) => {
  return (
    <SwitchPrimitive.Root
      className={cn(switchVariants({ variant }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className={cn(thumbVariants({ variant }))} />
    </SwitchPrimitive.Root>
  );
};
