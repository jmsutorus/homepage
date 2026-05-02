import { Footer } from "@/components/layout/footer";
import { PublicHeader } from "@/components/layout/public-header";

export default function TermsPage() {
  return (
    <div className="bg-media-background text-media-on-background font-lexend selection:bg-media-secondary-fixed selection:text-media-on-secondary-fixed min-h-screen flex flex-col">
      {/* TopAppBar */}
      <PublicHeader />

      <main className="flex-grow px-6 md:px-16 lg:px-32 py-16 max-w-5xl mx-auto mt-8">
        <header className="mb-20 space-y-6">
          <p className="text-media-secondary uppercase tracking-widest text-sm font-semibold">Terms of Service</p>
          <h1 className="text-5xl md:text-7xl font-bold text-media-primary tracking-tighter leading-tight">
            The Framework of our Forest
          </h1>
          <p className="text-xl md:text-2xl text-media-on-surface-variant max-w-2xl leading-relaxed mt-4">
            A transparent agreement built on trust, mutual respect, and the shared goal of protecting your personal growth and our community.
          </p>
        </header>

        <article className="space-y-24 mb-16">
          <section className="space-y-6 relative" id="overview">
            <div className="absolute -left-12 top-2 hidden lg:block text-media-outline-variant/30 text-6xl font-bold font-display">01</div>
            <h2 className="text-3xl font-bold text-media-primary tracking-tight">Acceptance of Terms</h2>
            <div className="text-media-on-surface-variant max-w-3xl leading-loose text-lg space-y-4">
              <p>By accessing or using the Earthbound platform, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service. These terms exist to create a safe, predictable environment for all members of our community.</p>
              <p>We believe in radical transparency. We will always notify you of significant changes to these terms via email or a prominent notice on our platform before they take effect.</p>
            </div>
          </section>

          <section className="space-y-6 relative" id="responsibilities">
            <div className="absolute -left-12 top-2 hidden lg:block text-media-outline-variant/30 text-6xl font-bold font-display">02</div>
            <h2 className="text-3xl font-bold text-media-primary tracking-tight">Curating with Integrity</h2>
            <div className="bg-media-surface-container-low rounded-xl p-8 md:p-12">
              <div className="text-media-on-surface-variant max-w-3xl leading-loose text-lg">
                <p>Earthbound is a sanctuary. As a member, you agree to use the platform in a way that respects the integrity of the space and the boundaries of others.</p>
                <ul className="space-y-6 mt-8 list-none pl-0">
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-media-secondary mt-1">psychology</span>
                    <span><strong>Authenticity:</strong> You will provide accurate information when creating an account and maintain the security of your credentials.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-media-secondary mt-1">handshake</span>
                    <span><strong>Respect:</strong> You will not use the platform to harass, abuse, or harm another person, or to violate any laws in your jurisdiction.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-media-secondary mt-1">nature</span>
                    <span><strong>Protection:</strong> You will not attempt to disrupt the platform&apos;s infrastructure, introduce malicious code, or scrape data without explicit permission.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6 relative" id="property">
            <div className="absolute -left-12 top-2 hidden lg:block text-media-outline-variant/30 text-6xl font-bold font-display">03</div>
            <h2 className="text-3xl font-bold text-media-primary tracking-tight">Intellectual Property</h2>
            <div className="text-media-on-surface-variant max-w-3xl leading-loose text-lg space-y-4">
              <p>We hold a simple, unwavering belief: <strong>your entries are yours alone.</strong></p>
              <p>You retain all rights and ownership to the content you create, submit, or display on Earthbound. We claim no ownership over your personal reflections, journals, or uploaded media.</p>
              <p>Conversely, the Earthbound platform itself—including its design, code, architecture, and original brand elements—is owned by us and is protected by international copyright and intellectual property laws.</p>
            </div>
          </section>

          <section className="space-y-6 relative" id="termination">
            <div className="absolute -left-12 top-2 hidden lg:block text-media-outline-variant/30 text-6xl font-bold font-display">04</div>
            <h2 className="text-3xl font-bold text-media-primary tracking-tight">The Right to Leave</h2>
            <div className="text-media-on-surface-variant max-w-3xl leading-loose text-lg space-y-4">
              <p>You may terminate your account at any time, for any reason. We believe in the &quot;right to be forgotten.&quot; When you delete your account, we initiate a total data deletion process.</p>
              <p>Your personal data, entries, and metadata will be permanently expunged from our active servers within 30 days, and from our encrypted backups within 90 days. We do not hold your history hostage.</p>
              <p>We also reserve the right to suspend or terminate accounts that fundamentally violate these terms, though we will always attempt to communicate clearly before taking such action unless immediate security is at risk.</p>
            </div>
          </section>

          <section className="space-y-6 relative" id="liability">
            <div className="absolute -left-12 top-2 hidden lg:block text-media-outline-variant/30 text-6xl font-bold font-display">05</div>
            <h2 className="text-3xl font-bold text-media-primary tracking-tight">Limitations & Liability</h2>
            <div className="bg-media-surface-container rounded-xl p-8">
              <div className="text-media-on-surface-variant max-w-3xl leading-relaxed text-base space-y-4">
                <p>While we strive to provide a secure and reliable sanctuary, Earthbound is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no warranties, expressed or implied, regarding the continuous availability or absolute error-free nature of the service.</p>
                <p>To the maximum extent permitted by law, Earthbound shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
              </div>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
