"use client";

import { cn } from "@/lib/utils";

interface CredentialCardProps {
  icon?: React.ReactNode;
  stat?: string;
  label: string;
  description?: string;
  className?: string;
}

export const CredentialCard = ({
  icon,
  stat,
  label,
  description,
  className,
}: CredentialCardProps) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        "backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-950/80",
        "border border-gray-800 rounded-2xl",
        "p-6 md:p-8",
        "transition-all duration-300",
        "hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/20",
        "hover:-translate-y-1",
        className
      )}
      data-aos="fade-up"
    >
      {/* Accent gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 to-purple-600/0 group-hover:from-cyan-400/5 group-hover:to-purple-600/5 transition-all duration-300 rounded-2xl" />
      
      <div className="relative space-y-4">
        {/* Icon */}
        {icon && (
          <div className="text-cyan-400 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
        
        {/* Stat */}
        {stat && (
          <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            {stat}
          </div>
        )}
        
        {/* Label */}
        <div className="text-xl md:text-2xl font-semibold text-white group-hover:text-cyan-400 transition-colors duration-200">
          {label}
        </div>
        
        {/* Description */}
        {description && (
          <div className="text-gray-400 text-sm md:text-base leading-relaxed">
            {description}
          </div>
        )}
      </div>
      
      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 blur-2xl group-hover:bg-cyan-400/10 transition-all duration-300" />
    </div>
  );
};

