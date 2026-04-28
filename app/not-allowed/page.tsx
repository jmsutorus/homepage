import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Not Authorized",
  description: "The Inner Grove is Restricted.",
};

export default function NotAllowed() {
  return (
    <div className="bg-media-surface text-media-on-surface min-h-screen flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 font-lexend antialiased relative overflow-hidden">
      <main className="w-full max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative z-10">
        {/* Illustration Area (Asymmetric Left) */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
          <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-2xl overflow-hidden bg-media-surface-container-low">
            {/* Background ambient glow */}
            <div className="absolute inset-0 bg-media-primary/5 blur-3xl z-0"></div>
            <Image
              alt="Locked wooden gate"
              className="object-cover relative z-10 rounded-2xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjav2Gysk2P2ts9bd98Lc3T-8pCQ192xY9tr-mBi-RHs_R8-Qd3oojZTnhLqIwoQMT20KhiyOo7_f29ZJQmj2K055GatM57lHvUBmCQYsfI6PZ7fyDWbRMeDcIHQ_xlEh18cM3kSiEUt3uSzZIg0ozmjnipNoQCKBdLKd4RIivFgKlgy_iXWFgPAP43hhbGn41tuGoXH5ZiOuHHrLtxycbxOH8MQan4JkL9JAJHo2qwAaI5Uyw9vNTicYfiGk9RoFqizu_JCyN8YE"
              fill
              priority
            />
          </div>
          {/* Decorative Element to break the grid */}
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-media-primary-fixed/20 rounded-full blur-2xl z-0"></div>
        </div>

        {/* Content Area (Right) */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 z-10">
          {/* Branding */}
          <div className="font-bold text-2xl tracking-tighter text-media-primary">
            Earthbound
          </div>
          {/* Error Copy */}
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.1em] text-media-secondary font-medium">
              Error 403
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-media-primary leading-tight">
              The Inner Grove <br className="hidden lg:block"/> is Restricted.
            </h1>
            <p className="text-lg text-media-on-surface-variant max-w-md leading-relaxed">
              {"It seems you don't have the key to this particular chapter yet. The path forward requires special permission to traverse."}
            </p>

          </div>
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
            <Link
              href="/request-access"
              className="bg-media-secondary text-media-on-secondary px-8 py-4 rounded-lg font-medium tracking-wide hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Request Access</span>
            </Link>
            <Link
              href="/journals"
              className="bg-media-surface-container-low text-media-primary px-8 py-4 rounded-lg font-medium tracking-wide hover:bg-media-surface-container-high transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">
                arrow_back
              </span>
              <span>Back to Journal</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Subtle Background Texture/Tonal shift */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-media-surface-container-low rounded-full blur-[100px] opacity-50 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-media-surface-container-low rounded-full blur-[120px] opacity-40 -translate-x-1/3 translate-y-1/3"></div>
      </div>
    </div>
  );
}
