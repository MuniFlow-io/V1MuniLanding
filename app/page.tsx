import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GlassHeading } from "@/components/ui/GlassHeading";
import { TrustBar } from "@/components/ui/TrustBar";
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
              Professional tools for{" "}
              <span className="text-cyan-400">municipal bonds</span>
            </h1>
            
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We build software for municipal bond professionals—starting with practical tools you can use today, working toward a comprehensive platform.
            </p>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-snug mt-8 mb-6">
              Each tool solves a specific workflow problem. No bloat, no guesswork—just reliable software built by people who know the industry.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/tools">
                <Button variant="primary" size="large">
                  Explore Tools
                </Button>
              </Link>
              <Link href="/platform-vision">
                <Button variant="secondary" size="large">
                  See Platform Vision
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

        {/* Tools Available Now */}
        <section className="py-20 px-6 bg-gray-950/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                Tools available now
              </h2>
              <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full" />
            </div>
            
            <div className="grid md:grid-cols-1 gap-8 max-w-3xl mx-auto" data-aos="fade-up">
              <Card variant="highlight" size="large">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Available Now</span>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-white">
                    Bond Generator
                  </h3>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    Deterministic assembly of executed bond certificates from finalized inputs. Upload your bond form template, maturity schedule, and CUSIPs—the tool validates and mechanically assembles certificates with same inputs producing the same output every time.
                  </p>
                  <p className="text-base text-gray-400">
                    Built for paralegals, deal admins, and counsel support staff involved in closing logistics after bond terms are final. No drafting, no recommendations—just deterministic assembly.
                  </p>
                  <div className="pt-4">
                    <Link href="/bond-generator">
                      <Button variant="secondary" size="medium">
                        Open Bond Generator
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              <Card variant="feature" size="large" className="border-dashed">
                <div className="space-y-6 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
                    <span className="text-xs font-medium text-gray-400">More Tools Coming Q1 2026</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white">
                    Building a suite of professional tools
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Bond Generator is the first of several standalone tools we&apos;re building for municipal bond professionals. Each tool solves a specific workflow problem without forcing you to change your entire process.
                  </p>
                  <div className="pt-2">
                    <Link href="/tools">
                      <Button variant="glass" size="medium">
                        See Roadmap
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* The Platform Behind the Tools */}
        <section className="py-24 px-6 bg-gray-950/50">
          <div className="max-w-4xl mx-auto text-center">
            <GlassHeading variant="minimal">
              <h2 className="text-4xl md:text-5xl font-semibold text-white mb-8">
                The platform behind the tools
              </h2>
            </GlassHeading>

            <Card variant="feature" size="large">
              <div className="space-y-6">
                <p className="text-xl text-gray-300 leading-relaxed">
                  MuniFlow is a comprehensive platform for managing municipal bond transactions—deal coordination, information flow, workflow visibility, and more.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed border-t border-gray-800 pt-6">
                  Bond Generator is our first public tool. The full platform includes deal management, term sheet versioning, approval workflows, and transaction coordination—built from decades of public finance practice.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/platform-vision">
                    <Button variant="secondary" size="medium">
                      See Platform Features
                    </Button>
                  </Link>
                  <Link href="/contact?demo=true">
                    <Button variant="glass" size="medium">
                      Schedule Demo
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>




        {/* CTA */}
        <section className="py-32 px-6 bg-gradient-to-b from-gray-950 via-gray-900 to-black relative">
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-3xl mx-auto text-center space-y-10 relative">
            <h2 className="text-4xl md:text-6xl font-semibold text-white leading-tight">
              Ready to <span className="text-cyan-400">get started</span>?
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Try the Bond Generator now, or schedule a demo to see the full platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/bond-generator">
                <Button variant="primary" size="large">
                  Try Bond Generator
                </Button>
              </Link>
              
              <Link href="/contact?demo=true">
                <Button variant="secondary" size="large">
                  Schedule Demo
                </Button>
              </Link>
            </div>
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
