"use client";

import Link from "next/link";
import { FileText, Calculator, Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Tool } from "@/app/tools/tools-config";

const iconMap = {
  FileText,
  Calculator,
  Calendar,
};

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = iconMap[tool.icon];
  const isAvailable = tool.status === 'available';

  return (
    <Card variant="feature" size="large" className="relative overflow-hidden">
      {/* Status Badge */}
      <div className="absolute top-6 right-6">
        {isAvailable ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-medium text-cyan-400">Available</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
            <Clock size={12} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-400">Coming Soon</span>
          </div>
        )}
      </div>

      {/* Icon */}
      <div className="mb-6">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
          isAvailable 
            ? 'bg-cyan-900/30 border border-cyan-700/40' 
            : 'bg-gray-800 border border-gray-700'
        }`}>
          <Icon 
            size={28} 
            className={isAvailable ? 'text-cyan-400' : 'text-gray-500'} 
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-white">
          {tool.name}
        </h3>
        
        <p className="text-gray-400 leading-relaxed min-h-[3rem]">
          {tool.description}
        </p>

        {/* Target Users */}
        <div className="pt-2">
          <p className="text-sm text-gray-500 mb-2">For:</p>
          <div className="flex flex-wrap gap-2">
            {tool.targetUsers.map((user) => (
              <span 
                key={user}
                className="px-2 py-1 rounded-md bg-gray-800/50 border border-gray-700/50 text-xs text-gray-400"
              >
                {user}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4">
          {isAvailable ? (
            <Link href={tool.href}>
              <Button variant="secondary" size="medium" className="w-full">
                Open Tool
              </Button>
            </Link>
          ) : (
            <Button 
              variant="glass" 
              size="medium" 
              className="w-full cursor-not-allowed opacity-50"
              disabled
            >
              Coming Q1 2026
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
