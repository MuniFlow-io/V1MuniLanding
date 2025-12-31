import { Navigation } from "@/components/layout/Navigation";
import { ContactForm } from "@/components/forms/ContactForm";

export default function ContactPage() {
  return (
    <div className="bg-black">
      <Navigation />
      
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
              Let's start a <span className="text-cyan-400">conversation</span>.
            </h1>
            
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Whether you want to try the app, share feedback, or just connect—we'd like to hear from you.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="pb-32 px-6">
          <ContactForm />
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

