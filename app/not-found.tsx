import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "404 Not Found",
  description: "A path less traveled... It seems you've wandered off the map.",
};

export default function NotFound() {
  return (
    <div className="bg-media-surface text-media-on-surface font-lexend antialiased min-h-screen flex flex-col justify-center items-center p-6 md:p-12 selection:bg-media-secondary/20 relative">
      <main className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24">
        {/* Illustration Side */}
        <div className="w-full md:w-1/2 flex justify-center order-2 md:order-1">
          <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden bg-media-surface-container-low dark:bg-white/80 isolate">
            <Image
              alt="Lost hiker illustration"
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuACzMWvYsZsbtAYdrdyfUq5HTIEbxzJVyLTZmGvNPhXDnnA5kQcbEDECQ-q_3GY5ue3F2QtG5Fln15iqNVco1YeKk5c9Rkpf8AltsUHK_cB6tLibO0W-8NIbwmfZVnqSbuV5MoMKuWhVUl205hdw3_Z4iWv9G-47lxYFVVS_9k0rB-2bwUurjRUVOC4T6d8b81Z5pm4DeqyGiOoKK7DY3ary2rluMMMiwTcXUuZjz1UeLG5DfPPWqPOh8M1hAyfOu6tMXKpKNHNJQ4"
              fill
              priority
            />
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left order-1 md:order-2">
          <span className="text-sm uppercase tracking-[0.05em] text-media-secondary font-semibold mb-4">
            Error 404
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-media-primary leading-tight mb-6">
            A Path Less Traveled...
          </h1>
          <p className="text-lg md:text-xl text-media-on-surface-variant max-w-md mb-10 leading-relaxed">
            {"...or just one that doesn't exist. It seems you've wandered off the map. Let's get you back to familiar ground."}
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-media-secondary hover:bg-media-secondary/90 text-media-on-secondary px-8 py-4 rounded-lg font-medium transition-transform duration-200 hover:scale-[1.02] active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[20px]">
              explore
            </span>
            Return to Base Camp
          </Link>
        </div>
      </main>

      {/* Subtle Background Texture/Gradients to avoid flatness */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-media-surface-container-low via-transparent to-transparent opacity-50"></div>
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-media-surface-container-low via-transparent to-transparent opacity-50"></div>
    </div>
  );
}
