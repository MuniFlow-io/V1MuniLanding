import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScopeCard } from "@/components/bond-generator/ScopeCard";
import { CapabilitiesCard } from "@/components/bond-generator/CapabilitiesCard";
import { LimitationsCard } from "@/components/bond-generator/LimitationsCard";
import { ResponsibilityCard } from "@/components/bond-generator/ResponsibilityCard";
import { WorkbenchStepper } from "@/components/bond-generator/WorkbenchStepper";
import Link from "next/link";

export default function BondGeneratorGuidePage() {
  return (
    <div className="bg-black">
      <Navigation />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        {/* Header Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-6xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-semibold text-white">
              Bond Generator Guide
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to know before generating bond certificates.
            </p>
            <p className="text-base text-gray-500 max-w-2xl mx-auto">
              Review the scope, capabilities, and limitations before starting the process.
            </p>
          </div>
        </section>

        {/* Main Two-Column Layout */}
        <section className="pb-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column - Context & Disclaimers */}
              <div className="lg:col-span-4 space-y-6">
                <ScopeCard />
                <CapabilitiesCard />
                <LimitationsCard />
                <ResponsibilityCard />

                {/* CTA */}
                <Card variant="highlight" size="medium">
                  <div className="text-center space-y-4">
                    <h3 className="text-base font-medium text-white">
                      Need a walkthrough?
                    </h3>
                    <Link href="/contact?demo=true">
                      <Button variant="secondary" size="medium">
                        Request walkthrough
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>

              {/* Right Column - Workbench Preview */}
              <div className="lg:col-span-8">
                <Card variant="feature" size="large">
                  <WorkbenchStepper currentStep={1} />

                  {/* Workbench Panel - Call to Action */}
                  <div className="min-h-[500px] flex items-center justify-center mt-8">
                    <div className="text-center space-y-6 max-w-md">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border border-cyan-700/30 mx-auto flex items-center justify-center">
                        <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">
                          Ready to get started?
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          You&apos;ve reviewed the guide. Now try the tool with your bond form template, maturity schedule, and CUSIP file.
                        </p>
                      </div>
                      <div className="pt-4 space-y-3">
                        <Link href="/bond-generator/workbench">
                          <Button variant="primary" size="large">
                            Start Bond Generator
                          </Button>
                        </Link>
                        <div>
                          <Link href="/bond-generator">
                            <Button variant="secondary" size="medium">
                              Back to Overview
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
