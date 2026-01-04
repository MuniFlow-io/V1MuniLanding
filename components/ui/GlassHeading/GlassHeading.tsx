import { cn } from "@/lib/utils";

interface GlassHeadingProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "minimal" | "accent";
}

export const GlassHeading = ({ 
  children, 
  className,
  variant = "default" 
}: GlassHeadingProps) => {
  if (variant === "minimal") {
    // Simplified version - just the heading with a subtle underline
    return (
      <div className={cn("mb-16 text-center", className)}>
        <div className="relative inline-block">
          {children}
          <div className="h-1 w-16 mx-auto mt-6 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === "accent") {
    // Accent version - heading with colored background accent
    return (
      <div className={cn("mb-16 text-center relative", className)}>
        <div className="relative inline-block px-8 py-6 rounded-2xl">
          {/* Subtle background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-purple-600/5 rounded-2xl blur-xl" />
          <div className="relative">{children}</div>
        </div>
      </div>
    );
  }

  // Default glass effect - simplified but still beautiful
  return (
    <div className={cn("relative mb-16", className)}>
      <div className={cn(
        "relative backdrop-blur-xl",
        "bg-gradient-to-br from-white/10 via-white/5 to-transparent",
        "rounded-2xl",
        "border border-white/20",
        "shadow-xl shadow-purple-900/20",
        "p-8 md:p-10",
        "overflow-hidden"
      )}>
        {/* Subtle accent gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-purple-600/5 pointer-events-none rounded-2xl" />
        
        {/* Content */}
        <div className="relative text-center z-10">
          {children}
        </div>
      </div>
      
      {/* Soft glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-purple-600/10 blur-2xl -z-10 opacity-50 rounded-2xl" />
    </div>
  );
};

