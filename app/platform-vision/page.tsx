import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

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
              Platform <span className="text-cyan-400">Vision</span>
            </h1>
            
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              A comprehensive system for structuring municipal bond deals—we&apos;re building it tool by tool.
            </p>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              We&apos;re starting with standalone tools that solve real problems today. The full platform brings them together into a unified workflow system.
            </p>
          </div>
        </section>

        {/* Tools Shipped */}
        <section className="py-20 px-6 bg-gray-950/50">
          <div className="max-w-4xl mx-auto" data-aos="fade-up">
            <Card variant="highlight" size="large">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Shipped & Available</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-white leading-tight">
                Bond Generator
              </h2>
              
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-6">
                Deterministic assembly of executed bond certificates from finalized inputs. Upload your bond form template, maturity schedule, and CUSIPs—the tool validates and mechanically assembles certificates.
              </p>

              <div className="pt-4">
                <Link href="/bond-generator">
                  <Button variant="secondary" size="medium">
                    Try Bond Generator
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* Divider */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-gray-700" />
              <span className="text-sm text-gray-500 uppercase tracking-wider">Platform Features (In Development)</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-700 to-gray-700" />
            </div>
          </div>
        </section>

        {/* Deal Setup - Screenshot Left, Content Right */}
        <section className="py-24 px-6 bg-gray-950/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center" data-aos="fade-up">
              {/* Screenshot */}
              <div className="order-2 lg:order-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-3xl blur-3xl opacity-40 group-hover:opacity-60 transition-all duration-300" />
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-3 border border-cyan-400/40 shadow-2xl shadow-cyan-500/20 group-hover:shadow-cyan-500/30 transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="relative aspect-[4/3] bg-white rounded-xl overflow-hidden shadow-inner border border-gray-200">
                      <Image
                        src="/images/features/deal-setup.png"
                        alt="MuniFlow Deal Setup interface showing structured form for creating new municipal bond deals"
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-1 w-12 bg-cyan-400 rounded-full" />
                  <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">01</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
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
              </div>
            </div>
          </div>
        </section>

        {/* Deal Overview - Content Left, Screenshot Right */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center" data-aos="fade-up">
              {/* Content */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-1 w-12 bg-blue-500 rounded-full" />
                  <span className="text-sm font-medium text-blue-500 uppercase tracking-wider">02</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
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
              </div>

              {/* Screenshot */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl opacity-40 group-hover:opacity-60 transition-all duration-300" />
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-3 border border-blue-500/40 shadow-2xl shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="relative aspect-[9/4] bg-white rounded-xl overflow-hidden shadow-inner border border-gray-200">
                      <Image
                        src="/images/features/deal-overview.png"
                        alt="MuniFlow Deal Overview showing core deal details and information snapshot"
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 45vw"
                      />
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </section>

        {/* Versioned Term Sheet - Screenshot Left, Content Right */}
        <section className="py-24 px-6 bg-gray-950/30">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center" data-aos="fade-up">
              {/* Screenshot */}
              <div className="order-2 lg:order-1">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl opacity-40 group-hover:opacity-60 transition-all duration-300" />
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-3 border border-purple-600/40 shadow-2xl shadow-purple-500/20 group-hover:shadow-purple-500/30 transition-all duration-300 group-hover:scale-[1.02]">
                    <div className="relative aspect-[4/3] bg-white rounded-xl overflow-hidden shadow-inner border border-gray-200">
                      <Image
                        src="/images/features/term-sheet.png"
                        alt="MuniFlow Versioned Term Sheet showing draft and revision tracking capabilities"
                        fill
                        className="object-contain"
                        sizes="(max-width: 1024px) 100vw, 45vw"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="order-1 lg:order-2 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-1 w-12 bg-purple-600 rounded-full" />
                  <span className="text-sm font-medium text-purple-600 uppercase tracking-wider">03</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight">
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
              </div>
            </div>
          </div>
        </section>

        {/* Supporting Capabilities */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto" data-aos="fade-up">
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
          <div className="max-w-4xl mx-auto" data-aos="fade-up">
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
              Try the <span className="text-cyan-400">tools today</span>
            </h2>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              We&apos;re building the platform step by step. Start with the tools that are ready now.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/tools">
                <Button variant="primary" size="large">
                  See All Tools
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
