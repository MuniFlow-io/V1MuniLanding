import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GlassHeading } from "@/components/ui/GlassHeading";
import Link from "next/link";

export default function BondGeneratorHomePage() {
  return (
    <div className="bg-black">
      <Navigation />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        {/* Hero Section */}
        <section className="pt-40 pb-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-radial from-cyan-900/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-5xl mx-auto text-center space-y-10 relative">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Bond Generator
            </h1>
            
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
            
            <p className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Deterministic assembly of executed bond certificates from finalized inputs.
            </p>

            <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Built by the MuniFlow team for municipal bond professionals—paralegals, deal admins, and counsel support staff involved in closing logistics.
            </p>

            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/bond-generator/guide">
                <Button variant="primary" size="large">
                  Try the Bond Generator
                </Button>
              </Link>
              <Link href="/contact?demo=true">
                <Button variant="secondary" size="large">
                  Request Walkthrough
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* What It Does - Simple Grid */}
        <section className="py-24 px-6 bg-gray-950/30">
          <div className="max-w-6xl mx-auto">
            <GlassHeading variant="minimal">
              <h2 className="text-3xl md:text-4xl font-semibold text-white">
                How it works
              </h2>
            </GlassHeading>

            <div className="grid md:grid-cols-5 gap-6">
              {[
                { step: "1", action: "Upload", desc: "Bond form template" },
                { step: "2", action: "Tag", desc: "Template variables" },
                { step: "3", action: "Validate", desc: "Maturity & CUSIP schedules" },
                { step: "4", action: "Review", desc: "Assembled bonds" },
                { step: "5", action: "Generate", desc: "Download ZIP" },
              ].map((item) => (
                <Card key={item.step} variant="feature" size="medium">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-400/10 border border-cyan-400/30 mx-auto flex items-center justify-center">
                      <span className="text-2xl font-bold text-cyan-400">{item.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{item.action}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Key Principle - Deterministic */}
        <section className="py-20 px-6 bg-gray-950/50">
          <div className="max-w-4xl mx-auto">
            <Card variant="highlight" size="large">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-900/50 border-2 border-purple-700/50 mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold text-white">
                  Deterministic by design
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                  Same inputs → same outputs. Every time. No inference, no guessing, no AI—just mechanical assembly of finalized data.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-24 px-6 bg-gray-950/30">
          <div className="max-w-6xl mx-auto">
            <GlassHeading variant="minimal">
              <h2 className="text-3xl md:text-4xl font-semibold text-white">
                Who this is for
              </h2>
            </GlassHeading>

            <div className="grid md:grid-cols-3 gap-8">
              <Card variant="feature" size="large">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Paralegals</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Assembly of final bond certificates from validated schedules without manual copy-paste.
                  </p>
                </div>
              </Card>

              <Card variant="feature" size="large">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Deal Admins</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Mechanical generation of certificates from finalized maturity and CUSIP schedules.
                  </p>
                </div>
              </Card>

              <Card variant="feature" size="large">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-900/30 border border-cyan-700/40 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Bond Counsel</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Controlled, deterministic assembly output after bond terms are final.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* What It Doesn't Do */}
        <section className="py-20 px-6 bg-gray-950/50">
          <div className="max-w-3xl mx-auto">
            <Card variant="feature" size="large">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                    What this tool does <span className="text-gray-600">not</span> do
                  </h2>
                  <p className="text-gray-400">Clear boundaries for regulated profession trust</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 pt-6">
                  {[
                    "Draft bond terms",
                    "Recommend structures",
                    "Infer missing data",
                    "Replace legal judgment",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-gray-500">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-gray-800 text-center">
                  <p className="text-sm text-gray-500">
                    This tool performs mechanical assembly only. User is responsible for review and accuracy.
                  </p>
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
              Ready to <span className="text-cyan-400">try it</span>?
            </h2>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              See how deterministic assembly works with your own bond form template.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/bond-generator/guide">
                <Button variant="primary" size="large">
                  Start with Guide
                </Button>
              </Link>
              
              <Link href="/contact?demo=true">
                <Button variant="secondary" size="large">
                  Request Walkthrough
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
