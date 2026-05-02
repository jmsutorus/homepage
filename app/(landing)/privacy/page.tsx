import { Footer } from "@/components/layout/footer";
import { PublicHeader } from "@/components/layout/public-header";

export default function PrivacyPage() {
  return (
    <div className="bg-media-background text-media-on-background font-lexend selection:bg-media-secondary-fixed selection:text-media-on-secondary-fixed">
      {/* TopAppBar */}
      <PublicHeader />

      <div className="px-4 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-16 mt-16">
        <div className="layout-content-container flex flex-col w-full max-w-[1200px] flex-1 bg-media-surface rounded-2xl overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col px-6 py-12 md:px-16 lg:px-24 max-w-4xl bg-media-surface relative mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 pt-4">
              <div className="flex flex-col gap-4">
                <p className="text-media-secondary text-xs font-bold uppercase tracking-[0.05em] font-label">Privacy Policy</p>
                <h1 className="text-media-primary text-4xl md:text-6xl font-black leading-tight tracking-[-0.03em] font-display max-w-md">
                  Your Sanctuary, Protected.
                </h1>
              </div>
              <div className="flex items-center rounded-lg h-10 px-4 bg-media-surface-container text-media-on-surface-variant text-sm font-medium">
                <span>Last updated: April 26, 2026</span>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-16">
              <section className="relative">
                <h3 className="text-media-primary text-2xl font-bold leading-tight font-headline mb-4">Data Curation</h3>
                <p className="text-media-on-surface-variant text-lg font-normal leading-relaxed">
                  At Earthbound, your life reflections are treated with the utmost respect. We only collect the necessary information to provide you with a seamless and personalized experience. This includes your journal entries, location data (if permitted), and basic account details. We do not sell your personal data to third parties.
                </p>
              </section>

              <section className="relative">
                <h3 className="text-media-primary text-2xl font-bold leading-tight font-headline mb-4">Privacy by Design</h3>
                <p className="text-media-on-surface-variant text-lg font-normal leading-relaxed mb-6">
                  Our architecture is fundamentally built around your privacy. We employ a local-first approach, meaning your entries, coordinates, and reflections live on your device before they ever touch our servers.
                </p>
                <p className="text-media-on-surface-variant text-lg font-normal leading-relaxed">
                  When data does sync across your devices, it is protected by state-of-the-art end-to-end encryption. Your key is yours alone; we cannot read your Earthbound journal, even if we were compelled to. The ink on these digital pages is visible only to you.
                </p>
              </section>

              <section className="relative">
                <h3 className="text-media-primary text-2xl font-bold leading-tight font-headline mb-4">Your Rights</h3>
                <p className="text-media-on-surface-variant text-lg font-normal leading-relaxed mb-6">
                  You retain complete sovereignty over your data. At any moment, you may export your entire history in open, accessible formats, ensuring your memories are never locked into our ecosystem.
                </p>
                <p className="text-media-on-surface-variant text-lg font-normal leading-relaxed">
                  Should you choose to leave Earthbound, you can initiate a total deletion protocol. This action unequivocally wipes your encrypted data from our synchronization servers permanently, leaving no trace behind.
                </p>
              </section>

              {/* Contact Box */}
              <section className="mt-8 bg-media-surface-container-low rounded-2xl p-8 md:p-10 relative overflow-hidden group hover:bg-media-surface-container transition-colors duration-500">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-media-secondary/5 rounded-full blur-2xl group-hover:bg-media-secondary/10 transition-colors duration-500"></div>
                <h3 className="text-media-primary text-xl font-bold leading-tight font-headline mb-4 relative z-10">Questions about your data?</h3>
                <p className="text-media-on-surface-variant text-lg font-normal leading-relaxed mb-8 max-w-lg relative z-10">
                  Our privacy team is available to address any concerns regarding how your personal information is handled. We believe in transparency without the legal jargon.
                </p>
                <a className="inline-flex items-center gap-3 text-media-secondary font-bold text-lg hover:text-media-on-secondary-container transition-colors relative z-10 group/link" href="mailto:privacy@earthbound.app">
                  <span className="material-symbols-outlined text-2xl group-hover/link:-translate-y-0.5 transition-transform">mail</span>
                  <span className="border-b-2 border-media-secondary/30 group-hover/link:border-media-secondary pb-0.5 transition-colors">privacy@earthbound.app</span>
                </a>
              </section>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
