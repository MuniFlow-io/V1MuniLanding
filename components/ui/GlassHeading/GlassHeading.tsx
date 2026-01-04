import { cn } from "@/lib/utils";

interface GlassHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassHeading = ({ children, className }: GlassHeadingProps) => {
  return (
    <div className={cn(
      "relative group mb-16",
      className
    )}>
      {/* Main glass container */}
      <div className={cn(
        // Core glass effect - very strong blur
        "relative backdrop-blur-[20px] -webkit-backdrop-blur-[20px]",
        "bg-gradient-to-br from-white/[0.15] via-white/[0.08] to-white/[0.05]",
        // Shape and border
        "rounded-2xl border border-white/40",
        // 3D depth with shadows
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]",
        // Inner shadow for depth
        "[box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_32px_0_rgba(0,0,0,0.37)]",
        "p-8"
      )}>
        {/* Light reflection gradient (top-left to simulate light source) */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60 pointer-events-none" />
        
        {/* Color accent reflection */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/10 via-purple-600/5 to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative text-center z-10">
          {children}
        </div>
      </div>
      
      {/* Outer glow for extra depth */}
      <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-purple-600/20 blur-lg -z-10 opacity-50" />
    </div>
  );
};

