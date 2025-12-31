import { Navigation } from "@/components/layout/Navigation";

export default function CredibilityPage() {
  return (
    <div className="bg-black">
      <Navigation />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        <section className="pt-40 pb-32 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <h1 className="text-6xl md:text-7xl font-bold text-white leading-[1.15] tracking-tight">
              Built by attorneys with 20 years in the industry.
            </h1>
            
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-muni-mint to-transparent" />
            
            <p className="text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Worked on major bond deals across different deal types. We understand the complexity.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

