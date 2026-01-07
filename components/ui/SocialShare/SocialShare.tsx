"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface SocialShareProps {
  hashtag?: string;
  className?: string;
  variant?: "inline" | "floating" | "compact";
}

export const SocialShare = ({
  hashtag = "MuniFlow",
  className,
  variant = "inline",
}: SocialShareProps) => {
  const [copied, setCopied] = useState(false);

  const handleLinkedInShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
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
          onClick={handleLinkedInShare}
          className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-400/10 border border-blue-400/30 hover:bg-blue-400/20 hover:border-blue-400/50 transition-all duration-200"
        >
          <LinkedInIcon className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-400 font-medium">Share</span>
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
            onClick={handleLinkedInShare}
            className="group flex items-center justify-center w-12 h-12 rounded-xl bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-200 hover:scale-110"
            aria-label="Share on LinkedIn"
          >
            <LinkedInIcon className="w-5 h-5 text-blue-400" />
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
        "hover:border-blue-400/30 transition-all duration-300",
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
            onClick={handleLinkedInShare}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-400/20 to-blue-500/20 border border-blue-400/40 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-400/20 transition-all duration-200 hover:scale-105"
          >
            <LinkedInIcon className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-blue-400 font-medium">LinkedIn</span>
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
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
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

