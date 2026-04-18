import Link from "next/link";
import { Space_Grotesk, Inter } from "next/font/google";
import { Share2, AtSign } from "lucide-react";

// Load fonts
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-[#0c0e12] text-[#f6f6fc] selection:bg-[#81ecff] selection:text-[#005762] flex min-h-screen flex-col ${inter.className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .glass-card { background: rgba(35, 38, 44, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(246, 246, 252, 0.05); }
        .neon-glow-primary { box-shadow: 0 0 20px rgba(129, 236, 255, 0.2); }
        .neon-glow-secondary { box-shadow: 0 0 20px rgba(255, 143, 0, 0.2); }
        .font-headline { font-family: ${spaceGrotesk.style.fontFamily}, sans-serif; }
      `}} />
      
      {/* TopNavBar */}
      <nav className="bg-[#0c0e12]/60 backdrop-blur-xl w-full top-0 sticky z-50 border-b border-transparent shadow-[0px_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
          <Link href="/">
            <div className="text-2xl font-bold tracking-tighter text-[#81ecff]">Homepage</div>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-[#f6f6fc]/70 hover:text-[#81ecff] transition-colors duration-300">Features</Link>
            <Link href="/docs" className="text-[#f6f6fc]/70 hover:text-[#81ecff] transition-colors duration-300">Docs</Link>
          </div>
          <Link href="/sign-up">
            <button className="cursor-pointer bg-gradient-to-br from-[#81ecff] to-[#00d4ec] text-[#005762] font-semibold px-6 py-2 rounded-lg transition-all hover:shadow-[0_0_15px_rgba(129,236,255,0.4)] hover:scale-105 active:scale-95">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#0c0e12] w-full py-12 px-8 border-t border-[#f6f6fc]/10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="text-lg font-bold text-[#81ecff]">Homepage</div>
            <p className="text-sm text-[#f6f6fc]/50">© 2024 Homepage Kinetic Nexus</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="/about" className="text-sm text-[#f6f6fc]/50 hover:text-[#ff8f00] transition-all">About</Link>
            {/* <Link href="/" className="text-sm text-[#f6f6fc]/50 hover:text-[#ff8f00] transition-all">Terms</Link> */}
          </div>
          <div className="flex gap-4">
            <button className="cursor-pointer w-10 h-10 rounded-full border border-[#46484d]/30 flex items-center justify-center hover:bg-[#23262c] transition-colors">
              <Share2 className="w-4 h-4 text-[#f6f6fc]/70" />
            </button>
            <button className="cursor-pointer w-10 h-10 rounded-full border border-[#46484d]/30 flex items-center justify-center hover:bg-[#23262c] transition-colors">
              <AtSign className="w-4 h-4 text-[#f6f6fc]/70" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
