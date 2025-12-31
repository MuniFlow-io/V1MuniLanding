"use client";

import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useHoverLift } from "@/components/animations/useHoverLift";

const cardVariants = cva(
  "rounded-2xl transition-all duration-200",
  {
    variants: {
      size: {
        medium: "p-6",
        large: "p-8 md:p-10",
      },
      variant: {
        solid: [
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-800",
          "hover:border-cyan-400",
          "shadow-lg hover:shadow-xl hover:shadow-purple-700/20",
        ],
        glass: [
          "bg-white/30 dark:bg-black/30",
          "backdrop-blur-2xl",
          "border border-white/40 dark:border-white/20",
          "shadow-2xl hover:shadow-[0_20px_70px_rgba(0,0,0,0.3)]",
        ],
        feature: [
          "bg-gray-900",
          "border border-gray-800",
          "hover:border-cyan-400",
          "shadow-lg shadow-transparent",
          "hover:shadow-xl hover:shadow-purple-700/30",
        ],
        highlight: [
          "bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/10",
          "border-2 border-purple-700/40",
          "shadow-lg shadow-purple-700/20",
          "hover:shadow-xl hover:shadow-purple-600/40",
        ],
      },
    },
    defaultVariants: {
      size: "medium",
      variant: "solid",
    },
  }
);

interface CardProps extends VariantProps<typeof cardVariants> {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, size, variant, className }: CardProps) => {
  const { y, onMouseEnter, onMouseLeave } = useHoverLift();

  return (
    <motion.div
      style={{ y }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(cardVariants({ size, variant }), className)}
    >
      {children}
    </motion.div>
  );
};
