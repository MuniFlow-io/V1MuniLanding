import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GlassHeading } from "@/components/ui/GlassHeading";
import { ToolCard } from "@/components/tools/ToolCard";
import { getAvailableTools, getComingSoonTools } from "./tools-config";
import Link from "next/link";

export default function ToolsPage() {
  const availableTools = getAvailableTools();
  const comingSoonTools = getComingSoonTools();

  return (
    <div className="bg-black">
      <Navigation />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        {/* Hero Section */}
        <section className="pt-40 pb-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-radial from-cyan-900/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-5xl mx-auto text-center space-y-10 relative">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
              MuniFlow <span className="text-cyan-400">Tools</span>
            </h1>
            
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Professional tools for municipal bond financing—built to enhance your workflow without replacing it.
            </p>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-snug">
              Each tool solves a specific problem. No bloat, no complexity—just deterministic, reliable software for bond professionals.
            </p>
          </div>
        </section>

        {/* Available Tools */}
        <section className="py-20 px-6 bg-gray-950/30">
          <div className="max-w-6xl mx-auto">
            <GlassHeading variant="minimal">
              <h2 className="text-3xl md:text-4xl font-semibold text-white">
                Available Now
              </h2>
            </GlassHeading>

            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {availableTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>

        {/* Coming Soon Tools */}
        {comingSoonTools.length > 0 && (
          <section className="py-20 px-6 bg-gray-950/50">
            <div className="max-w-6xl mx-auto">
              <GlassHeading variant="minimal">
                <h2 className="text-3xl md:text-4xl font-semibold text-white">
                  Coming Soon
                </h2>
              </GlassHeading>

              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                {comingSoonTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>

              {/* Waitlist CTA */}
              <div className="mt-16 max-w-2xl mx-auto" data-aos="fade-up">
                <Card variant="highlight" size="large">
                  <div className="text-center space-y-6">
                    <h3 className="text-2xl font-semibold text-white">
                      Get Early Access
                    </h3>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      Join the waitlist to be first to try new tools as they launch. We&apos;ll notify you when they&apos;re ready.
                    </p>
                    <div className="pt-4">
                      <Link href="/contact?waitlist=true">
                        <Button variant="primary" size="large">
                          Join Waitlist
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Platform Vision */}
        <section className="py-20 px-6 bg-gray-950/30">
          <div className="max-w-3xl mx-auto">
            <Card variant="feature" size="large">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                    Part of a Larger Vision
                  </h2>
                  <p className="text-gray-400">Tools first, platform next</p>
                </div>
                
                <div className="pt-6 border-t border-gray-800 space-y-4 text-gray-300">
                  <p className="leading-relaxed">
                    These standalone tools are the first step toward MuniFlow—a comprehensive platform for managing municipal bond transactions from start to finish.
                  </p>
                  <p className="leading-relaxed">
                    We&apos;re building tools first because we believe in earning trust through utility, not promises. Each tool solves a real problem today.
                  </p>
                  <p className="leading-relaxed">
                    When the platform launches, your tool data and workflows will migrate seamlessly.
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-800 text-center">
                  <Link href="/platform-vision">
                    <Button variant="secondary" size="medium">
                      See Platform Roadmap
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 bg-gradient-to-b from-gray-950 via-gray-900 to-black relative">
          <div className="absolute inset-0 bg-gradient-radial from-cyan-900/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-3xl mx-auto text-center space-y-10 relative">
            <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
              Built by <span className="text-cyan-400">bond professionals</span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Every tool reflects decades of public finance experience. We know the workflows because we&apos;ve lived them.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/credibility">
                <Button variant="primary" size="large">
                  See Our Background
                </Button>
              </Link>
              
              <Link href="/contact">
                <Button variant="secondary" size="large">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-gray-900">
          <div className="max-w-6xl mx-auto text-center text-gray-500">
            <p>© 2026 <span className="text-cyan-400 font-medium">MuniFlow</span>. Built for municipal bond financing teams.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
