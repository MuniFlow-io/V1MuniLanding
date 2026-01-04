import { cn } from "@/lib/utils";

interface GlassHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassHeading = ({ children, className }: GlassHeadingProps) => {
  return (
    <div className={cn(
      "relative backdrop-blur-md bg-gradient-to-br from-white/10 via-white/5 to-transparent",
      "border border-white/20 rounded-2xl p-8 mb-16",
      "shadow-lg shadow-cyan-500/10",
      "before:absolute before:inset-0 before:rounded-2xl before:p-[1px]",
      "before:bg-gradient-to-br before:from-cyan-400/20 before:via-transparent before:to-purple-600/20",
      "before:-z-10",
      className
    )}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/5 via-transparent to-purple-600/5 blur-xl" />
      <div className="relative text-center">
        {children}
      </div>
    </div>
  );
};

