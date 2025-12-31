"use client";

import { Navigation } from "@/components/layout/Navigation";
import { FeatureGallery, type Feature } from "@/components/ui/FeatureGallery";
import { useRouter } from "next/navigation";

const features: Feature[] = [
  {
    id: "contacts",
    title: "Contacts & Team Management",
    description: "Keep track of everyone involved in a deal—bond counsel, underwriters, issuers, and more. See who's working on what, when they joined, and how to reach them.",
    iframeUrl: undefined, // TODO: Add your app URL here
    comingSoon: false,
  },
  {
    id: "document-tagger",
    title: "Document Tagger & Editor",
    description: "Tag, organize, and edit deal documents in one place. No more hunting through email attachments or shared drives to find the right version.",
    iframeUrl: undefined, // TODO: Add your app URL here
    comingSoon: false,
  },
  {
    id: "workflow-tracker",
    title: "Workflow & Timeline Tracker",
    description: "See where every deal stands at a glance. Track milestones, deadlines, and blockers without endless status meetings.",
    iframeUrl: undefined, // TODO: Add your app URL here
    comingSoon: true,
  },
  {
    id: "deal-dashboard",
    title: "Deal Dashboard",
    description: "A single view of everything happening across all your active deals. Prioritize what needs attention and stay ahead of deadlines.",
    iframeUrl: undefined, // TODO: Add your app URL here
    comingSoon: true,
  },
];

export default function BuildingPage() {
  const router = useRouter();

  const handleRequestDemo = (featureId: string) => {
    // Navigate to contact page with feature ID in query params
    router.push(`/contact?feature=${featureId}`);
  };

  return (
    <div className="bg-black">
      <Navigation />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
              What we&apos;re <span className="text-cyan-400">building</span>.
            </h1>
            
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Tools built from real municipal bond workflows—designed to reduce friction without changing how teams work.
            </p>
          </div>
        </section>

        {/* Feature Gallery */}
        <section className="pb-32 px-6">
          <div className="max-w-5xl mx-auto">
            <FeatureGallery features={features} onRequestDemo={handleRequestDemo} />
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="py-12 px-6 border-t border-gray-900">
          <div className="max-w-6xl mx-auto text-center text-gray-500">
            <p>© 2025 <span className="text-cyan-400 font-medium">MuniFlow</span>. Built for municipal bond deal teams.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
