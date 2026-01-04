import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/Card";

export default function CredibilityPage() {
  return (
    <div className="bg-black">
      <Navigation />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        {/* Hero */}
        <section className="pt-40 pb-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center space-y-10 relative">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
              About <span className="text-cyan-400">MuniFlow</span>
            </h1>
            
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
          </div>
        </section>

        {/* Built from Practice */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto" data-aos="fade-up">
            <Card variant="highlight" size="large" className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 blur-3xl pointer-events-none" />
              
              <div className="relative">
                <div className="h-1 w-16 bg-cyan-400 mb-6 rounded-full" />
                
                <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-white leading-tight">
                  Built from long-term public finance practice.
                </h2>
                
                <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed">
                  <p>
                    MuniFlow is shaped by decades of experience working on municipal bond transactions across a wide range of issuers, deal types, and financing structures.
                  </p>
                  
                  <p>
                    It reflects firsthand understanding of how public finance deals actually operate—across legal, financial, and governmental teams—and where coordination, visibility, and continuity most often start to slip.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Experience Informs Structure */}
        <section className="py-24 px-6 bg-gray-950/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20" data-aos="fade-up">
              <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4">
                Experience informs the structure.
              </h2>
              <div className="h-1 w-20 mx-auto bg-cyan-400/60 rounded-full" />
            </div>

            <Card variant="feature" size="large" data-aos="fade-up" data-aos-delay="100">
              <div className="space-y-8">
                <p className="text-xl text-gray-300 leading-relaxed">
                  Over time, the same challenges appear again and again:
                </p>
                
                <div className="space-y-4 text-lg text-gray-400">
                  <p>• Critical deal terms spread across emails, spreadsheets, and drafts</p>
                  <p>• Unclear ownership of next steps</p>
                  <p>• Version confusion across documents</p>
                  <p>• Approvals moving on different timelines</p>
                  <p>• Institutional knowledge living in people instead of systems</p>
                </div>

                <p className="text-xl text-gray-300 leading-relaxed pt-4">
                  MuniFlow is designed to address these recurring issues by bringing clearer structure—while preserving flexibility as the deal evolves.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* What MuniFlow Is */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto" data-aos="fade-up">
            <Card variant="highlight" size="large">
              <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-white leading-tight">
                What MuniFlow is (and is not).
              </h2>
              
              <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed">
                <p>
                  MuniFlow is not a document generator, a generic project management tool, or a replacement for legal judgment.
                </p>
                
                <p>
                  It is a deal system designed to bring clarity, shared context, and continuity to municipal bond transactions—supporting the people and processes that already carry the work forward.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Built Thoughtfully */}
        <section className="py-24 px-6 bg-gray-950/30">
          <div className="max-w-4xl mx-auto" data-aos="fade-up">
            <Card variant="feature" size="large">
              <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-white leading-tight">
                Built thoughtfully, in conversation.
              </h2>
              
              <div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed">
                <p>
                  MuniFlow is being built carefully—grounded in real workflows and shaped through ongoing conversation with practitioners across the public finance ecosystem.
                </p>
                
                <p>
                  The goal is not disruption for its own sake, but practical improvement—small structural changes that make complex deals easier to manage, understand, and move forward.
                </p>
              </div>
            </Card>
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

