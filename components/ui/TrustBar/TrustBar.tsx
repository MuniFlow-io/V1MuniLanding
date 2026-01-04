"use client";

import { cn } from "@/lib/utils";

interface TrustItem {
  icon?: React.ReactNode;
  text: string;
  highlight?: string;
}

interface TrustBarProps {
  items: TrustItem[];
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

export const TrustBar = ({ items, className, variant = "default" }: TrustBarProps) => {
  return (
    <div
      className={cn(
        "w-full overflow-hidden",
        className
      )}
      data-aos="fade-up"
    >
      <div
        className={cn(
          "backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl",
          "shadow-lg shadow-purple-900/20",
          variant === "compact" ? "px-6 py-4" : "px-8 py-6",
          variant === "detailed" ? "px-10 py-8" : ""
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center gap-8 flex-wrap",
            variant === "detailed" ? "gap-12" : ""
          )}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 group",
                variant === "detailed" ? "flex-col text-center" : ""
              )}
            >
              {item.icon && (
                <div className="text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200">
                  {item.icon}
                </div>
              )}
              <div
                className={cn(
                  "text-gray-300 text-sm md:text-base",
                  variant === "detailed" ? "text-base md:text-lg" : ""
                )}
              >
                {item.highlight ? (
                  <>
                    <span className="text-cyan-400 font-semibold">
                      {item.highlight}
                    </span>{" "}
                    {item.text}
                  </>
                ) : (
                  item.text
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

