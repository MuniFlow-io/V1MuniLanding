import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function BuildingPage() {
  return (
    <div className="bg-black">
      <Navigation />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        {/* Hero Section */}
        <section className="pt-40 pb-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center space-y-10 relative">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
              What we&apos;re <span className="text-cyan-400">building</span>.
            </h1>
            
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A shared system for structuring municipal bond deals—starting with the parts that matter most.
            </p>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              MuniFlow is being developed by focusing on the core workflows that anchor every transaction: how a deal is set up, how key details are shared, and how terms stay aligned as the deal evolves.
            </p>
          </div>
        </section>

        {/* Deal Setup */}
        <section className="py-24 px-6 bg-gray-950/30">
          <div className="max-w-4xl mx-auto">
            <Card variant="highlight" size="large" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 blur-3xl pointer-events-none" />
              
              <div className="relative space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-1 w-12 bg-cyan-400 rounded-full" />
                  <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">01</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
                  Deal Setup
                </h2>
                
                <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed">
                  <p>
                    Create a deal with the information that actually drives everything downstream—issuer authority, transaction type, structure, and status.
                  </p>
                  
                  <p>
                    This step establishes a clean, shared foundation so the deal team starts aligned from day one.
                  </p>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-gray-500 italic">
                    Screenshot: Structured deal setup designed for real municipal finance workflows.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Deal Overview */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <Card variant="highlight" size="large" className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
              
              <div className="relative space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-1 w-12 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium text-blue-500 uppercase tracking-wider">02</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
                  Deal Overview
                </h2>
                
                <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed">
                  <p>
                    A single view of the deal&apos;s core details—the who, what, why, how and when—available to everyone on the team.
                  </p>
                  
                  <p>
                    This page replaces scattered notes, emails, and spreadsheets with a shared snapshot that stays current as the deal develops.
                  </p>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-gray-500 italic">
                    Screenshot: A shared reference point for the entire deal team.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Versioned Term Sheet */}
        <section className="py-24 px-6 bg-gray-950/30">
          <div className="max-w-4xl mx-auto">
            <Card variant="highlight" size="large" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-3xl pointer-events-none" />
              
              <div className="relative space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-1 w-12 bg-purple-600 rounded-full" />
                  <span className="text-sm font-medium text-purple-600 uppercase tracking-wider">03</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
                  Versioned Term Sheet
                </h2>
                
                <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed">
                  <p>
                    A living term sheet that supports drafting and revisions with clarity—without losing history.
                  </p>
                  
                  <p>
                    Changes are tracked, drafts can be published deliberately, and prior versions remain accessible so everyone understands what changed and when.
                  </p>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-gray-500 italic">
                    Screenshot: A structured term sheet built for collaboration and control.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Supporting Capabilities */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <Card variant="feature" size="large">
              <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-white leading-tight">
                Supporting capabilities
              </h2>
              
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                MuniFlow also includes supporting tools—such as team activity tracking and messaging, document approvals (without death by email), and contact management—that complement the core workflows above.
              </p>
            </Card>
          </div>
        </section>

        {/* Why We're Starting Here */}
        <section className="py-24 px-6 bg-gray-950/50">
          <div className="max-w-4xl mx-auto">
            <Card variant="highlight" size="large">
              <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-white leading-tight">
                Why we&apos;re starting here
              </h2>
              
              <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed">
                <p>
                  Municipal bond deals usually get done—but they often do so with unnecessary friction when information fragments early and never fully reconnects.
                </p>
                
                <p>
                  This initial release is about validating a simple idea:
                </p>

                <p className="text-xl text-white font-medium pl-6 border-l-2 border-cyan-400">
                  Clarity early in the process supports flexibility later—without forcing decisions before they&apos;re ready.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 bg-gradient-to-b from-gray-950 via-gray-900 to-black relative">
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-3xl mx-auto text-center space-y-10 relative">
            <h2 className="text-4xl md:text-6xl font-semibold text-white leading-tight">
              See a <span className="text-cyan-400">working example</span>.
            </h2>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              If you work on municipal bond deals and this approach resonates, we&apos;d like to hear from you.
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
