"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface SocialShareProps {
  hashtag?: string;
  twitterHandle?: string;
  className?: string;
  variant?: "inline" | "floating" | "compact";
}

export const SocialShare = ({
  hashtag = "MuniFlow",
  twitterHandle = "muniflow",
  className,
  variant = "inline",
}: SocialShareProps) => {
  const [copied, setCopied] = useState(false);

  const handleTwitterShare = () => {
    const text = `Excited about @${twitterHandle} - transforming municipal bond workflows! #${hashtag}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  const handleCopyHashtag = () => {
    navigator.clipboard.writeText(`#${hashtag}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <button
          onClick={handleTwitterShare}
          className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400/10 border border-cyan-400/30 hover:bg-cyan-400/20 hover:border-cyan-400/50 transition-all duration-200"
        >
          <TwitterIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-cyan-400 font-medium">Share</span>
        </button>
        
        <button
          onClick={handleCopyHashtag}
          className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/10 border border-purple-600/30 hover:bg-purple-600/20 hover:border-purple-600/50 transition-all duration-200"
        >
          <HashIcon className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-400 font-medium">
            {copied ? "Copied!" : hashtag}
          </span>
        </button>
      </div>
    );
  }

  if (variant === "floating") {
    return (
      <div
        className={cn(
          "fixed bottom-8 right-8 z-50",
          "backdrop-blur-xl bg-black/40 border border-white/10",
          "rounded-2xl p-4 shadow-2xl",
          className
        )}
      >
        <div className="flex flex-col gap-3">
          <button
            onClick={handleTwitterShare}
            className="group flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-200 hover:scale-110"
            aria-label="Share on Twitter"
          >
            <TwitterIcon className="w-5 h-5 text-cyan-400" />
          </button>
          
          <button
            onClick={handleCopyHashtag}
            className="group flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30 hover:border-purple-600/50 transition-all duration-200 hover:scale-110"
            aria-label={`Copy ${hashtag} hashtag`}
          >
            {copied ? (
              <CheckIcon className="w-5 h-5 text-purple-400" />
            ) : (
              <HashIcon className="w-5 h-5 text-purple-400" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-950/80",
        "border border-gray-800 rounded-2xl p-6",
        "hover:border-cyan-400/30 transition-all duration-300",
        className
      )}
      data-aos="fade-up"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold text-white mb-1">
            Spread the word
          </h3>
          <p className="text-sm text-gray-400">
            Share #{hashtag} with your network
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleTwitterShare}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400/20 to-cyan-500/20 border border-cyan-400/40 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-400/20 transition-all duration-200 hover:scale-105"
          >
            <TwitterIcon className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-cyan-400 font-medium">Tweet</span>
          </button>
          
          <button
            onClick={handleCopyHashtag}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600/20 border border-purple-600/40 hover:border-purple-600/60 hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-200 hover:scale-105"
          >
            {copied ? (
              <>
                <CheckIcon className="w-5 h-5 text-purple-400" />
                <span className="text-purple-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <HashIcon className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-purple-400 font-medium">{hashtag}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple icon components
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const HashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20L17 20M17 20L17 4M17 20L3 20M10 16L14 4" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

