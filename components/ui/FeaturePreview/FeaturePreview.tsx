"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface FeaturePreviewProps {
  title: string;
  description: string;
  iframeUrl?: string;
  comingSoon?: boolean;
  featureId?: string;
  onRequestDemo?: (featureId: string) => void;
}

export const FeaturePreview = ({
  title,
  description,
  iframeUrl,
  comingSoon = false,
  featureId,
  onRequestDemo,
}: FeaturePreviewProps) => {
  return (
    <Card variant="feature" size="large" className="overflow-hidden">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl md:text-3xl font-semibold text-white">
              {title}
            </h3>
            {comingSoon && (
              <span className="px-3 py-1 text-xs font-medium bg-purple-700/30 text-purple-400 rounded-full border border-purple-600/50">
                Coming Soon
              </span>
            )}
          </div>
          <p className="text-gray-400 text-lg leading-relaxed">
            {description}
          </p>
        </div>

        {/* Preview Area */}
        <div className="relative">
          {iframeUrl ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-gray-700 bg-gray-950">
              <iframe
                src={iframeUrl}
                className="w-full h-full"
                title={`${title} preview`}
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
              />
              
              {/* Overlay for coming soon */}
              {comingSoon && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-4xl">🚧</div>
                    <p className="text-xl font-semibold text-white">
                      In Development
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-gray-900 to-gray-950 border-2 border-gray-700 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="text-5xl">📱</div>
                <p className="text-gray-400">Preview coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {onRequestDemo && featureId && (
          <div className="pt-2">
            <Button
              variant="secondary"
              size="medium"
              onClick={() => onRequestDemo(featureId)}
            >
              Request Demo of This Feature
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

