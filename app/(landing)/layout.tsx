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
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
