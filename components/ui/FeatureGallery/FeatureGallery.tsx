"use client";

import { FeaturePreview } from "@/components/ui/FeaturePreview";

export interface Feature {
  id: string;
  title: string;
  description: string;
  iframeUrl?: string;
  comingSoon?: boolean;
}

interface FeatureGalleryProps {
  features: Feature[];
  onRequestDemo?: (featureId: string) => void;
}

export const FeatureGallery = ({ features, onRequestDemo }: FeatureGalleryProps) => {
  return (
    <div className="space-y-16">
      {features.map((feature, index) => (
        <div key={feature.id} id={feature.id}>
          {/* Feature Number Badge */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-700 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-700/40">
              {index + 1}
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/60 to-transparent" />
          </div>

          <FeaturePreview
            title={feature.title}
            description={feature.description}
            iframeUrl={feature.iframeUrl}
            comingSoon={feature.comingSoon}
            featureId={feature.id}
            onRequestDemo={onRequestDemo}
          />
        </div>
      ))}
    </div>
  );
};

