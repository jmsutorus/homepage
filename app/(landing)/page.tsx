import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-media-background text-media-on-background font-lexend selection:bg-media-secondary-fixed selection:text-media-on-secondary-fixed">
      {/* TopAppBar */}
      <header className="bg-media-surface/80 backdrop-blur-xl font-lexend tracking-tight font-medium top-0 sticky z-50 border-b border-media-primary/5">
        <div className="flex justify-between items-center px-8 py-6 w-full max-w-screen-2xl mx-auto">
          <div className="text-2xl font-black tracking-tighter text-media-primary">Earthbound</div>
          <nav className="hidden md:flex gap-8">
            <Link href="#" className="text-media-secondary font-bold border-b-2 border-media-secondary pb-1 scale-102 active:scale-98 transition-transform duration-200">Wellness</Link>
            <Link href="#" className="text-media-on-surface-variant hover:text-media-secondary transition-all duration-300 ease-in-out">Travel</Link>
            <Link href="#" className="text-media-on-surface-variant hover:text-media-secondary transition-all duration-300 ease-in-out">Relationships</Link>
            <Link href="#" className="text-media-on-surface-variant hover:text-media-secondary transition-all duration-300 ease-in-out">Media</Link>
            <Link href="#" className="text-media-on-surface-variant hover:text-media-secondary transition-all duration-300 ease-in-out">Tasks</Link>
          </nav>
          <div className="flex items-center gap-6">
            <Link href="/sign-in">
              <button className="text-media-on-surface-variant font-medium hover:text-media-secondary transition-colors">Login</button>
            </Link>
            <Link href="/sign-up">
              <button className="bg-media-secondary text-media-on-secondary px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-all scale-102 active:scale-98">Create Account</button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Cinematic Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              className="w-full h-full object-cover brightness-75" 
              alt="cinematic wide shot of a misty sun-drenched ancient forest with towering trees and soft atmospheric light filtering through the canopy" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqCDLalc2fmr_g7qCQSryj2h8LN5PWmfylb3r7siag12qkIDc_mWwMaCv3cL5-LJbm_9J-ZbrFBq9bh_UAdor48Gu_rDff_E3BZ0eIdNxcs9WVkSg0kvcwLjCDg50W-JJ2HTwDCvgfiVfIHNeuxlAHsCbmBL3aMvbNq5CWYXeuowkfiUzIeDhsx9bJoyhlYfPSZxTrhqh6BHzLwZtJ5h4xUu9FhGFQtaUkAwkjx7J3oVNYMQdVyUnv8ajwdDRnUqkMlU4gp-xtDN0"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-media-primary/40 to-transparent"></div>
          </div>
          <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-8 md:px-12">
            <div className="max-w-3xl">
              <h1 className="text-6xl md:text-8xl font-black text-media-surface tracking-tighter leading-tight mb-8">
                Curate a Life of <span className="text-media-secondary-fixed">Intention.</span>
              </h1>
              <p className="text-xl md:text-2xl text-media-surface/90 mb-12 font-light leading-relaxed max-w-xl">
                A digital sanctuary for the modern archivist. Track your evolution through the chapters of wellness, travel, and connection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up">
                  <button className="bg-media-secondary text-media-on-secondary px-10 py-5 rounded-lg text-lg font-bold kinetic-hover editorial-shadow">
                    Start Your Collection
                  </button>
                </Link>
                <Link href="/sign-in">
                  <button className="bg-media-surface/10 backdrop-blur-md border border-media-surface/20 text-media-surface px-10 py-5 rounded-lg text-lg font-bold hover:bg-media-surface/20 transition-all">
                    Member Login
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* The Manifesto */}
        <section className="py-24 md:py-40 bg-media-surface">
          <div className="max-w-screen-xl mx-auto px-8 flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
              <span className="text-media-secondary font-bold tracking-[0.2em] uppercase text-sm mb-6 block">Our Manifesto</span>
              <h2 className="text-4xl md:text-6xl font-black text-media-primary tracking-tighter mb-8 leading-none">The Kinetic Life.</h2>
              <ul className="space-y-6">
                <li>
                  <p className="text-media-on-surface-variant text-xl leading-relaxed">
                    In an age of endless scrolling and digital noise, Earthbound serves as an anchor. We believe intentionality isn&apos;t a destination, but a movement—a kinetic harmony between where you&apos;ve been and where you are going.
                  </p>
                </li>
                <li>
                  <p className="text-media-on-surface-variant text-xl leading-relaxed italic border-l-4 border-media-secondary/30 pl-6">
                    &quot;Your life is not a feed to be consumed, but a gallery to be curated.&quot;
                  </p>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2 relative">
              <div className="aspect-[4/5] bg-media-surface-container-high rounded-xl overflow-hidden kinetic-hover editorial-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="w-full h-full object-cover grayscale opacity-80 mix-blend-multiply" 
                  alt="high-end architectural detail showing clean lines and minimal concrete geometry with dramatic light and shadow play" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF2QEssdb_3gohEuYgeQWsaf2G1k-auIG7ud58QICTQW85MxzKoqkT8CTf2J3SQnGRvifX6opJiy6r6cq61lql6EhKqsOnuUbClJFVHT1YnPxbE0mZtii35XOPcPCo-NYaMyJOpzW-ja7e1ECOhQN7M6neIsZhwu0DFgYoK58dqkOR02pOIgPipVCc6335-Q1ekkvMDM99i_xPq70DIawDPy5a0QpqEHd_2YNHVdXNPp4NOQTYzUT6_-sKaWHOVQ104ysxwH5PwPM"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-media-primary-fixed rounded-lg -z-10"></div>
            </div>
          </div>
        </section>

        {/* The Narrative: Chapters Bento Grid */}
        <section className="py-24 bg-media-surface-container-low overflow-hidden">
          <div className="max-w-screen-2xl mx-auto px-8">
            <div className="mb-20">
              <h2 className="text-5xl font-black text-media-primary tracking-tighter mb-4">The Chapters.</h2>
              <p className="text-media-on-surface-variant text-lg">Define your journey across our curated focal points.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-auto md:h-[800px]">
              {/* Wellness Card */}
              <div className="md:col-span-7 bg-media-surface-container-lowest p-10 rounded-xl flex flex-col justify-between kinetic-hover editorial-shadow group overflow-hidden relative">
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-4xl text-media-secondary mb-6">self_improvement</span>
                  <h3 className="text-3xl font-black text-media-primary mb-4">Wellness</h3>
                  <p className="text-media-on-surface-variant max-w-sm">Chronicle your physical and mental rituals. From sunrise meditation to evening endurance.</p>
                </div>
                <div className="absolute right-0 bottom-0 w-2/3 h-2/3 opacity-20 group-hover:opacity-40 transition-opacity">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    className="w-full h-full object-cover rounded-tl-full" 
                    alt="serene close-up of a person practicing yoga in a minimal sunlit studio with soft linen textures" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGimQFISSLUqu0pc49nlPPiZdcbR3ocbIerfvj9-pChPGyuSKkrLmTnBFyvjjm26xS7n9lF4Fif5D_5GEQRLqaqJ2RTAQWRPhkrUn2UOO2H-gUTDDfnE81d0dRXqpUgK3MsSCf8cbyf5t32ZynT8akdeH7bf6eY2EFVqYNtRX9Q85GiMZhAVgi5zFaS0Ut3GqtPLheCmGI24C-gBEqv-mpe4AGkZqnZZkD7WkyMXZ5D8UsntAvNWkfOMp8i-qyiv1KnjmC93YfvB0"
                  />
                </div>
              </div>
              {/* Travel Card */}
              <div className="md:col-span-5 bg-media-primary p-10 rounded-xl flex flex-col justify-end kinetic-hover editorial-shadow relative overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" 
                  alt="aerial view of a luxury yacht sailing through turquoise alpine lake waters surrounded by pine forests" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ0TYsRxI608ROrSWHxtihLkOFuD6S1ZFugvU32zSP-Xfn_EC1ZYbDTrI9bDTLF8XW7BdPuPQ79gvsN9JjkrqSWKl2sIQ2B9_U0KsqMf13dOHWz0Jvojf6ET61SE2yWcnY31eO8YCf6WqapkqM8dQWp4vb4S4GNmBYMrq589XP8S6hxmUOQbL9byHMOIMzXyfGK3jRrJ1HVdNKPVYCi1yxis3vCb9BLY4NFN4ilQenVIGW1nnn2cNnnHdhGjYqEl8KHy6FIKGXLt0"
                />
                <div className="relative z-10">
                  <span className="material-symbols-outlined text-4xl text-media-secondary-fixed mb-6">explore</span>
                  <h3 className="text-3xl font-black text-media-surface mb-2">Travel</h3>
                  <p className="text-media-surface/70">Map the geographies that changed your perspective.</p>
                </div>
              </div>
              {/* Relationships Card */}
              <div className="md:col-span-5 bg-media-secondary p-10 rounded-xl flex flex-col justify-between kinetic-hover editorial-shadow">
                <div>
                  <span className="material-symbols-outlined text-4xl text-media-surface mb-6">diversity_1</span>
                  <h3 className="text-3xl font-black text-media-surface mb-4">Relationships</h3>
                </div>
                <p className="text-media-surface/90 text-lg">Archive the people, the dates, and the connections that form your social fabric.</p>
              </div>
              {/* Media Card */}
              <div className="md:col-span-7 bg-media-surface-container-high p-10 rounded-xl flex items-center gap-12 kinetic-hover editorial-shadow">
                <div className="flex-1">
                  <span className="material-symbols-outlined text-4xl text-media-primary mb-6">auto_stories</span>
                  <h3 className="text-3xl font-black text-media-primary mb-4">Media</h3>
                  <p className="text-media-on-surface-variant">Your library of influence. Books, cinema, and soundscapes that soundtrack your life.</p>
                </div>
                <div className="hidden sm:grid grid-cols-2 gap-4 w-1/2">
                  <div className="aspect-square bg-media-primary-fixed rounded shadow-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      className="w-full h-full object-cover" 
                      alt="stack of vintage leather-bound books on a dark oak table with a small glass of whiskey" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4PvwWvmAwmKDbGJCmKb4O06bKxokZA4Ut5IEe35vgIb1dBpDPdkupdNFYia8jCpEVFNJFjNeR4wX0iClrWPDjQdzhtrfNZMTCo-DAme5asqaC1gF1b4JT8HXpZubrCPjS6rPzsP5EHCZ7BnYNQxixWs0O6lklKr4QOMGUNPFVkaw3rjHkHXA05ANcTmbSKROo_sePZHm5GsfKS6pTTTLfwlFjPPTrFb7qLkC5EGoMdeEXY5XZRR6TtS43QLaWKCeDjice5FVZNno"
                    />
                  </div>
                  <div className="aspect-square bg-media-secondary-fixed rounded shadow-lg overflow-hidden mt-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      className="w-full h-full object-cover" 
                      alt="high-quality audio headphones resting on a minimalist marble surface with warm natural lighting" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpZbH5wqtqrSkXjRIFZWz-iYxzBZcj0EglpInq5lIB4Q3D-ruK29P2r96AM2O1jfgsunb8cfnc9htokJMWbpStcdhwqTg4Cca2E1ycivDk-7J-9fQq_0Xh9S1tJgzO8BsRlbIyhvVhBikHufdHuVCe_HxUTGOEtXYkVwn3X-AtD2XFC10ZKDj0CMX1HtuEPMCYE7jJYFiF6kaFuNuYs3VK9X-S9twJN0nF3uCbDvQHIYX6hNVBKZvsNRnZNNOYJL1JgLZ_kumxdlU"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-32 bg-media-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-media-secondary-container via-transparent to-transparent"></div>
          </div>
          <div className="max-w-screen-xl mx-auto px-8 text-center relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-media-surface tracking-tighter mb-10 leading-tight">
              Your life is a masterpiece.<br />Begin the next chapter.
            </h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link href="/sign-up">
                <button className="bg-media-secondary text-media-on-secondary px-12 py-6 rounded-lg text-xl font-black kinetic-hover editorial-shadow">
                  Begin Your Chapter
                </button>
              </Link>
              <p className="text-media-primary-fixed-dim text-lg italic max-w-xs text-left hidden md:block">
                Join 24,000+ curators living with intention.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-media-surface-container-highest flex flex-col md:flex-row justify-between items-center px-12 py-16 w-full border-t border-media-primary/5 text-sm uppercase tracking-widest">
        <div className="flex flex-col items-center md:items-start gap-4 mb-8 md:mb-0">
          <div className="font-black text-media-primary text-xl">Earthbound</div>
          <p className="text-media-on-surface-variant opacity-90 lowercase normal-case">© 2024 Earthbound. Kinetic Harmony in Curation.</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-8">
          <Link href="#" className="text-media-on-surface-variant hover:text-media-secondary hover:translate-x-1 transition-all">About</Link>
          <Link href="#" className="text-media-on-surface-variant hover:text-media-secondary hover:translate-x-1 transition-all">Philosophy</Link>
          <Link href="#" className="text-media-on-surface-variant hover:text-media-secondary hover:translate-x-1 transition-all">Privacy</Link>
          <Link href="#" className="text-media-on-surface-variant hover:text-media-secondary hover:translate-x-1 transition-all">Terms</Link>
          <Link href="#" className="text-media-on-surface-variant hover:text-media-secondary hover:translate-x-1 transition-all">Support</Link>
        </nav>
      </footer>
    </div>
  );
}
