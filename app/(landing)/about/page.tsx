import Link from "next/link";
import { Footer } from "@/components/layout/footer";

export default function AboutPage() {
  return (
    <div className="bg-media-background text-media-on-background font-lexend selection:bg-media-secondary-fixed selection:text-media-on-secondary-fixed">
      {/* TopAppBar */}
      <header className="bg-media-surface/80 backdrop-blur-xl font-lexend tracking-tight font-medium top-0 sticky z-50 border-b border-media-primary/5">
        <div className="flex justify-between items-center px-8 py-6 w-full max-w-screen-2xl mx-auto">
          <Link href="/">
            <div className="text-2xl font-black tracking-tighter text-media-primary cursor-pointer">Homepage</div>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/sign-in">
              <button className="cursor-pointer text-media-on-surface-variant font-medium hover:text-media-secondary transition-colors">Login</button>
            </Link>
            <Link href="/sign-up">
              <button className="cursor-pointer bg-media-secondary text-media-on-secondary px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all scale-102 active:scale-98">Create Account</button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-growmd:pt-32">
        {/* Hero Section */}
        <section className="relative w-full h-[614px] md:h-[819px] flex items-center justify-center bg-media-surface-container-low mb-24 overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="Sun-dappled forest path with tall trees" 
              className="w-full h-full object-cover opacity-80" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzw1TOtkTswdGFm681b9o1KDI3uIuIDHzoeR_Eh9u8mNmperTO05YD1pLn_3Avov0qiNJHA_Sd8djrET5JNQj0ZC007sqrUDgVhLQD4B4EwJCBUkByVJjkb-et48dqokGgTwK6sq03QVNFI4P9AfHUAvfcLU_fYJpEIL_G_AqSxRcR4OJpdTXuhBYiRs_wDpT6VKbwo2ornCGjXaKio3cq13e67MKMTqRIxSAiGs9B3jeTd5QpTsSxrI-Me-WwbCEmaBFeUhTysRE"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-media-background via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-media-primary font-display tracking-tight leading-tight">
              Crafting a Life of Intention
            </h1>
          </div>
        </section>

        {/* The Manifesto */}
        <section className="max-w-screen-xl mx-auto px-6 md:px-12 mb-32 flex flex-col md:flex-row gap-16 items-start">
          <div className="md:w-1/3">
            <h2 className="text-3xl font-semibold text-media-primary font-headline md:sticky md:top-32">
              The Manifesto
            </h2>
          </div>
          <div className="md:w-2/3 text-media-on-surface-variant leading-relaxed text-lg">
            <p className="text-2xl font-light text-media-primary mb-8 leading-snug">
              <span className="text-6xl float-left mr-4 font-display text-media-secondary leading-none">W</span>
              e believe that life is not a feed to be mindlessly consumed, but a gallery to be thoughtfully curated. In a world of endless noise, we choose the deliberate over the default.
            </p>
            <p className="mb-6">
              The &apos;Kinetic Life&apos; is our rejection of passive existence. It is an active participation in the beauty of the everyday. It is finding profound meaning in the texture of a well-worn book, the specific warmth of a morning coffee, and the quiet rhythm of a walk through the woods.
            </p>
            <p>
              We build tools and foster a community for those who seek to anchor themselves in reality. Those who prefer the tactile weight of genuine experience over the fleeting rush of digital validation. Here, we slow down to look closer.
            </p>
          </div>
        </section>

        {/* Our Philosophy */}
        <section className="bg-media-surface-container-low py-32 px-6 md:px-12 mb-32">
          <div className="max-w-screen-xl mx-auto">
            <h2 className="text-4xl font-bold text-media-primary font-headline text-center mb-20 tracking-tight">
              Our Philosophy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {/* Value 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-media-surface-container-lowest flex items-center justify-center mb-8 shadow-sm">
                  <span className="material-symbols-outlined text-3xl text-media-secondary">my_location</span>
                </div>
                <h3 className="text-xl font-semibold text-media-primary font-headline mb-4">Intentionality</h3>
                <p className="text-media-on-surface-variant">Every object, habit, and moment should serve a purpose. We curate not to accumulate, but to clarify what truly matters.</p>
              </div>
              {/* Value 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-media-surface-container-lowest flex items-center justify-center mb-8 shadow-sm">
                  <span className="material-symbols-outlined text-3xl text-media-secondary">handyman</span>
                </div>
                <h3 className="text-xl font-semibold text-media-primary font-headline mb-4">Craftsmanship</h3>
                <p className="text-media-on-surface-variant">We revere the well-made. Whether it&apos;s a physical artifact or a digital experience, we value the care poured into its creation.</p>
              </div>
              {/* Value 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-media-surface-container-lowest flex items-center justify-center mb-8 shadow-sm">
                  <span className="material-symbols-outlined text-3xl text-media-secondary">diversity_3</span>
                </div>
                <h3 className="text-xl font-semibold text-media-primary font-headline mb-4">Community</h3>
                <p className="text-media-on-surface-variant">A shared appreciation for the quiet moments connects us. We are building a collective of mindful curators.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Behind the Curation */}
        <section className="max-w-screen-xl mx-auto px-6 md:px-12 mb-32 flex flex-col-reverse md:flex-row gap-16 items-center">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-media-primary font-headline mb-8 tracking-tight">Behind the Curation</h2>
            <p className="text-media-on-surface-variant text-lg mb-6 leading-relaxed">
              Earthbound was born from a collective exhaustion with the digital treadmill. Our founders—designers, writers, and makers—sought a sanctuary from the infinite scroll.
            </p>
            <p className="text-media-on-surface-variant text-lg leading-relaxed">
              What started as a shared notebook of thoughts on mindful living evolved into this space. We are not gurus; we are fellow travelers trying to build a heavier, more tactile life.
            </p>
          </div>
          <div className="md:w-1/2 relative">
            <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-media-surface-container shadow-[0_8px_32px_rgba(6,27,14,0.06)] transform rotate-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                alt="Leather journal and pen on desk" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuClalCDvBf3F2LShlW9gjrQR3TTy7rYBZJA6uWw9nGYGQLdWdrMfsXU_K2IyFu53JXEcGrfwIOPPuz2Ev-9jWp_ionH4_-dpbxhs0DDQPhZj5mXD8A2MncxUqE_ypx9xuiYQS0ZPS0CbPFoK5XaJEKbW6WqdHsxKS2z2HUiDLKnGk-HQ6buMTTvCDk2awP1PLVZh5x9gO_D6yk6komkk-6yBtkWljO9iZ_cUfCEluQEgBZ4DxYygWY3HTzIVzvFdI7JENr6kOWIng0"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-media-primary-container rounded-full opacity-10 mix-blend-multiply blur-2xl"></div>
          </div>
        </section>

        {/* Join the Collective */}
        <section className="bg-media-primary text-media-on-primary py-32 px-6 text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl mb-6 text-media-secondary">auto_awesome</span>
            <h2 className="text-4xl md:text-5xl font-bold font-headline mb-6 tracking-tight">Join the Collective</h2>
            <p className="text-media-on-primary/80 text-lg mb-10">
              Begin your journey towards a more intentional, curated life.
            </p>
            <Link href="/sign-up">
              <button className="bg-media-secondary text-media-on-secondary px-8 py-4 rounded-xl font-headline text-lg hover:bg-media-secondary-container hover:text-media-primary transition-colors duration-300 shadow-lg shadow-media-secondary/20 hover:scale-105 active:scale-95 cursor-pointer font-bold">
                Start Your Collection
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
