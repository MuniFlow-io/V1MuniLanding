import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GlassHeading } from "@/components/ui/GlassHeading";
import { TrustBar } from "@/components/ui/TrustBar";
import { SocialShare } from "@/components/ui/SocialShare";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-black">
      <Navigation />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        {/* Hero Section - Clean & Impactful */}
        <section className="pt-40 pb-32 px-6 relative">
          {/* Subtle radial gradient background */}
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-5xl mx-auto text-center space-y-10 relative">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
              Municipal bond deals,{" "}
              <span className="text-cyan-400">structured</span>.
            </h1>
            
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We turn email threads, spreadsheets, and institutional memory into a living record of the deal—designed to evolve as the transaction takes shape.
            </p>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-snug mt-8 mb-6">
              Documentation, approvals, key dates, and deal terms—structured around how municipal bond deals actually run.
            </p>

            <div className="pt-6">
              <Link href="/contact">
                <Button variant="primary" size="large">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Bar - Credibility Indicators */}
        <section className="py-12 px-6 bg-black/50">
          <div className="max-w-6xl mx-auto">
            <TrustBar
              items={[
                { highlight: "Decades", text: "of public finance practice" },
                { highlight: "Issuer-side", text: "judgment" },
                { highlight: "Top 10", text: "firm background" },
                { highlight: "Real", text: "municipal bond expertise" },
              ]}
            />
          </div>
        </section>

        {/* What We Focus On */}
        <section className="py-24 px-6 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <GlassHeading variant="minimal">
              <h2 className="text-4xl md:text-5xl font-semibold text-white">
                We&apos;re focused on:
              </h2>
            </GlassHeading>

            <div className="grid md:grid-cols-3 gap-8">
              <div data-aos="fade-up" data-aos-delay="100">
                <Card variant="feature" size="large">
                  <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors duration-200 text-center">
                    Deal Coordination
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed text-center">
                    How issuers, counsel, advisors, and lenders move a deal forward—without duplicating work or losing the thread.
                  </p>
                </Card>
              </div>

              <div data-aos="fade-up" data-aos-delay="200">
                <Card variant="feature" size="large">
                  <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors duration-200 text-center">
                    Information Flow
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed text-center">
                    Where deal terms, drafts, and approvals live—and how updates are tracked without surprise emails.
                  </p>
                </Card>
              </div>

              <div data-aos="fade-up" data-aos-delay="300">
                <Card variant="feature" size="large">
                  <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors duration-200 text-center">
                    Workflow Visibility
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed text-center">
                    Clear visibility into what&apos;s been decided, what&apos;s pending, and what can&apos;t move forward yet.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* How We're Building */}
        <section className="py-24 px-6 bg-gray-950/30">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <GlassHeading variant="minimal">
              <h2 className="text-4xl md:text-5xl font-semibold text-white">
                How we&apos;re building this:
              </h2>
            </GlassHeading>

            <div className="grid md:grid-cols-3 gap-10 text-left">
              <div className="space-y-4 group">
                <div className="h-1 w-12 bg-cyan-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                <h3 className="text-2xl font-semibold text-white group-hover:text-cyan-400 transition-colors duration-200">
                  From real workflows
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  We start with how deals actually run—not abstract processes—including legal review, approvals, and public-sector constraints.
                </p>
              </div>

              <div className="space-y-4 group">
                <div className="h-1 w-12 bg-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                <h3 className="text-2xl font-semibold text-white group-hover:text-blue-500 transition-colors duration-200">
                  Through conversation
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Shaped by ongoing discussions with practitioners—across issuer, counsel, and advisor roles.
                </p>
              </div>

              <div className="space-y-4 group">
                <div className="h-1 w-12 bg-purple-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                <h3 className="text-2xl font-semibold text-white group-hover:text-purple-600 transition-colors duration-200">
                  Built carefully
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Evolving based on what works in the field—without compromising professional judgment, accountability, or compliance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What MuniFlow Is */}
        <section className="py-20 px-6 bg-gray-950/50">
          <div className="max-w-3xl mx-auto" data-aos="fade">
            <Card variant="feature" size="large">
              <div className="text-center space-y-6">
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                  MuniFlow is not a document generator or a generic project tracker.
                </p>
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                  It&apos;s a structured workspace for municipal bond transactions—built around how deals actually move.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Built from Practice */}
        <section className="py-20 px-6 bg-gray-950/30">
          <div className="max-w-4xl mx-auto" data-aos="fade-up">
            <Card variant="highlight" size="large">
              <h2 className="text-3xl md:text-4xl font-semibold text-white text-center mb-8">
                Built from decades of public finance practice.
              </h2>
              <div className="space-y-6">
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed text-center">
                  MuniFlow is shaped by long-term experience working on municipal bond transactions across a wide range of issuers and financing structures.
                </p>
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed text-center">
                  It reflects firsthand understanding of how deals actually move—and where better structure makes the difference.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Invitation to Talk */}
        <section className="py-32 px-6 bg-gradient-to-b from-gray-950 via-gray-900 to-black relative">
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-3xl mx-auto text-center space-y-10 relative">
            <h2 className="text-4xl md:text-6xl font-semibold text-white leading-tight">
              Let&apos;s <span className="text-cyan-400">talk</span>.
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              If you work on municipal bond transactions and this resonates, we&apos;d like to hear from you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/contact">
                <Button variant="primary" size="large">
                  Get in Touch
                </Button>
              </Link>
              
              <Link href="/contact?demo=true">
                <Button variant="secondary" size="large">
                  See How it Works
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-20 px-6 bg-gray-950/50">
          <div className="max-w-4xl mx-auto">
            <SocialShare 
              hashtag="MuniFlow"
            />
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="py-12 px-6 border-t border-gray-900">
          <div className="max-w-6xl mx-auto text-center text-gray-500">
            <p>© 2026 <span className="text-cyan-400 font-medium">MuniFlow</span>. Built for municipal bond financing teams.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
