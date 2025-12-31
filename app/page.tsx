import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
              We turn fragmented workflows into shared systems—without forcing teams to change how they work.
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

        {/* What We Focus On */}
        <section className="py-24 px-6 bg-gray-950/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4">
                We&apos;re focused on:
              </h2>
              <div className="h-1 w-20 mx-auto bg-cyan-400/60 rounded-full" />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card variant="feature" size="large">
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors duration-200">
                  Deal Coordination
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  How teams move work forward across multiple parties and timelines.
                </p>
              </Card>

              <Card variant="feature" size="large">
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors duration-200">
                  Information Flow
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Where critical details live and how they reach the right people.
                </p>
              </Card>

              <Card variant="feature" size="large">
                <h3 className="text-2xl font-semibold mb-4 text-white group-hover:text-cyan-400 transition-colors duration-200">
                  Workflow Visibility
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Seeing what&apos;s happening, what&apos;s next, and what needs attention.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Proof of Domain Understanding */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <Card variant="highlight" size="large" className="relative overflow-hidden">
              {/* Subtle corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 blur-3xl pointer-events-none" />
              
              <div className="relative">
                <div className="h-1 w-16 bg-cyan-400 mb-6 rounded-full" />
                
                <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-white leading-tight">
                  Built by someone who&apos;s been in the deals.
                </h2>
                
                <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed">
                  <p>
                    Amira has worked on municipal bond deals, seeing firsthand where workflows break down and where small changes create real impact.
                  </p>
                  
                  <p>
                    MuniFlow is built from that experience—shaped by what actually happens in deal teams.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* How We're Building */}
        <section className="py-24 px-6 bg-gray-950/30">
          <div className="max-w-4xl mx-auto text-center space-y-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4">
                How we&apos;re building this:
              </h2>
              <div className="h-1 w-20 mx-auto bg-blue-500/60 rounded-full" />
            </div>

            <div className="grid md:grid-cols-3 gap-10 text-left">
              <div className="space-y-4 group">
                <div className="h-1 w-12 bg-cyan-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                <h3 className="text-2xl font-semibold text-white group-hover:text-cyan-400 transition-colors duration-200">
                  From real workflows
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  We start with how deals actually run—not abstract processes.
                </p>
              </div>

              <div className="space-y-4 group">
                <div className="h-1 w-12 bg-blue-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                <h3 className="text-2xl font-semibold text-white group-hover:text-blue-500 transition-colors duration-200">
                  Through conversation
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Shaped by ongoing discussions with practitioners.
                </p>
              </div>

              <div className="space-y-4 group">
                <div className="h-1 w-12 bg-purple-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                <h3 className="text-2xl font-semibold text-white group-hover:text-purple-600 transition-colors duration-200">
                  Iterating intentionally
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Evolving based on what works in the field.
                </p>
              </div>
            </div>
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
              If you&apos;re working in municipal bond deals and this resonates, we&apos;d like to hear from you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/contact">
                <Button variant="primary" size="large">
                  Get in Touch
                </Button>
              </Link>
              
              <Link href="/contact?demo=true">
                <Button variant="secondary" size="large">
                  Request a Demo
                </Button>
              </Link>
            </div>
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
