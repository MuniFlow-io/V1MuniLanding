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
        "relative backdrop-blur-[24px] -webkit-backdrop-blur-[24px]",
        "bg-gradient-to-br from-white/[0.18] via-white/[0.12] to-white/[0.08]",
        // Shape with soft edges
        "rounded-3xl",
        // Glass layer border (soft, not hard)
        "border-[1.5px] border-white/50",
        // 3D depth with multiple shadows
        "shadow-[0_8px_32px_0_rgba(0,0,0,0.37),0_2px_8px_0_rgba(0,0,0,0.2)]",
        // Inner highlight (top edge catch light)
        "[box-shadow:inset_0_2px_1px_0_rgba(255,255,255,0.4),inset_0_-1px_1px_0_rgba(255,255,255,0.1),0_8px_32px_0_rgba(0,0,0,0.37)]",
        "p-10 overflow-hidden"
      )}>
        {/* Edge fade - makes edges blur out like a bubble */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-radial from-transparent via-transparent to-white/10 pointer-events-none" />
        
        {/* Light reflection gradient (top-left to simulate light source) */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-white/5 to-transparent opacity-80 pointer-events-none" />
        
        {/* Color accent reflections at angles */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/15 via-transparent to-purple-600/10 pointer-events-none" />
        
        {/* Glass surface layer - makes it feel like something is OVER the text */}
        <div className="absolute inset-0 rounded-3xl bg-white/[0.03] backdrop-blur-sm pointer-events-none" />
        
        {/* Content with subtle depth */}
        <div className="relative text-center z-10 [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
          {children}
        </div>
      </div>
      
      {/* Soft outer glow that fades out */}
      <div className="absolute inset-[-2px] rounded-3xl bg-gradient-to-br from-cyan-400/30 via-blue-500/15 to-purple-600/25 blur-2xl -z-10 opacity-60" />
      
      {/* Edge softening - creates bubble-like soft edges */}
      <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_20px_rgba(255,255,255,0.15)] -z-[5] pointer-events-none" />
    </div>
  );
};

