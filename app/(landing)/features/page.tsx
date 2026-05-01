import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Film, Activity, CheckSquare, Calendar, Shield, Zap, Rss, Home, Infinity, Rocket, Sparkles } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="bg-media-background text-media-on-background font-lexend selection:bg-media-secondary-fixed selection:text-media-on-secondary-fixed min-h-screen flex flex-col">
      <header className="bg-media-surface/80 backdrop-blur-xl font-lexend tracking-tight font-medium top-0 sticky z-50 border-b border-media-primary/5">
        <div className="flex justify-between items-center px-8 py-6 w-full max-w-screen-2xl mx-auto">
          <Link href="/">
            <div className="text-2xl font-black tracking-tighter text-media-primary cursor-pointer">Earthbound</div>
          </Link>
          <div className="flex items-center">
            <Link href="/sign-in">
              <button className="cursor-pointer bg-media-secondary text-media-on-secondary px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-sm">
                Login
              </button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-[#81ecff]/10 blur-[120px] rounded-full"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none text-[#f6f6fc] mb-6">
            Features that <br /><span className="text-[#ff8f00] italic">Empower.</span>
          </h1>
          <p className="text-xl text-[#aaabb0] max-w-2xl mx-auto leading-relaxed">
            Discover all the powerful capabilities and integrations that make Homepage the ultimate personal life dashboard.
          </p>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-xl bg-[#81ecff]/10 flex items-center justify-center mb-6">
                <Infinity className="w-8 h-8 text-[#81ecff]" />
              </div>
              <h2 className="font-headline text-4xl font-bold tracking-tight">Tracking</h2>
              <p className="text-[#aaabb0] text-lg leading-relaxed">
                Remember what you watched, what you did, and what you need to do.
              </p>
            </div>
            <div className="glass-card p-12 rounded-3xl relative overflow-hidden group min-h-[400px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#81ecff]/5 to-transparent"></div>
              <div className="relative z-10 flex gap-6 mt-12 animate-[bounce_5s_infinite]">
                 <div className="w-20 h-20 bg-[#1d2025] border border-[#46484d] rounded-2xl flex items-center justify-center shadow-2xl -rotate-6"><Film className="w-10 h-10 text-[#81ecff]"/></div>
                 <div className="w-24 h-24 bg-[#1d2025] border border-[#46484d] rounded-2xl flex items-center justify-center shadow-2xl -translate-y-8"><Calendar className="w-12 h-12 text-[#ff8f00]"/></div>
                 <div className="w-20 h-20 bg-[#1d2025] border border-[#46484d] rounded-2xl flex items-center justify-center shadow-2xl rotate-12"><Activity className="w-10 h-10 text-[#a68cff]"/></div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center flex-row-reverse">
            <div className="order-2 md:order-1 glass-card p-12 rounded-3xl relative overflow-hidden group min-h-[400px] flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#ff8f00]/5 to-transparent"></div>
              <div className="relative z-10 text-center w-full max-w-sm">
                <div className="glass-card p-6 rounded-2xl border border-[#ff8f00]/30 shadow-[0_0_30px_rgba(255,143,0,0.2)]">
                  <div className="h-2 w-1/3 bg-[#ff8f00] rounded-full mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-[#46484d]/50 rounded-full"></div>
                    <div className="h-2 w-5/6 bg-[#46484d]/50 rounded-full"></div>
                    <div className="h-2 w-4/6 bg-[#46484d]/50 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <div className="w-14 h-14 rounded-xl bg-[#ff8f00]/10 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-[#ff8f00]" />
              </div>
              <h2 className="font-headline text-4xl font-bold tracking-tight">Kinetic UI Experience</h2>
              <p className="text-[#aaabb0] text-lg leading-relaxed">
                Enjoy a lightning-fast experience built on Next.js 14. Real-time updates push data to your browser instantly over optimized websockets.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-[#f6f6fc]"><Zap className="w-5 h-5 text-[#ff8f00]" /> Zero-latency rendering</li>
                <li className="flex items-center gap-3 text-[#f6f6fc]"><Shield className="w-5 h-5 text-[#ff8f00]" /> Completely secure end-to-end data</li>
                <li className="flex items-center gap-3 text-[#f6f6fc]"><Rocket className="w-5 h-5 text-[#ff8f00]" /> Blazing fast background synchronization</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-24 bg-[#111318]/30 border-y border-[#46484d]/20">
        <div className="max-w-7xl mx-auto px-8 text-center">
            <h3 className="font-headline text-3xl font-bold tracking-tight mb-16">Everything you need, built natively.</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-2 transition-all">
                <Calendar className="w-8 h-8 text-[#81ecff] mb-4" />
                <h4 className="font-headline text-xl font-bold mb-2">Calendar</h4>
                <p className="text-[#aaabb0] text-sm">Sync with Google Calendar to see your upcoming events and schedule at a glance.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-2 transition-all">
                <Activity className="w-8 h-8 text-[#ff8f00] mb-4" />
                <h4 className="font-headline text-xl font-bold mb-2">Mood Tracking</h4>
                <p className="text-[#aaabb0] text-sm">Log your daily mood and visualize trends over time to understand your well-being.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-2 transition-all">
                <Home className="w-8 h-8 text-[#a68cff] mb-4" />
                <h4 className="font-headline text-xl font-bold mb-2">Parks & Travel</h4>
                <p className="text-[#aaabb0] text-sm">Explore and track your visits to national and state parks easily.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-2 transition-all">
                <CheckSquare className="w-8 h-8 text-[#81ecff] mb-4" />
                <h4 className="font-headline text-xl font-bold mb-2">Task Management</h4>
                <p className="text-[#aaabb0] text-sm">Manage your daily to-dos and stay organized with a simple, effective task list.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-2 transition-all">
                <Rss className="w-8 h-8 text-[#ff8f00] mb-4" />
                <h4 className="font-headline text-xl font-bold mb-2">Goals</h4>
                <p className="text-[#aaabb0] text-sm">Set and track your long-term goals, and watch your progress grow over time.</p>
              </div>
              <div className="glass-card p-8 rounded-2xl text-left hover:-translate-y-2 transition-all">
                <Shield className="w-8 h-8 text-[#a68cff] mb-4" />
                <h4 className="font-headline text-xl font-bold mb-2">Media</h4>
                <p className="text-[#aaabb0] text-sm">Track your media consumption and see what you&apos;ve watched.</p>
              </div>
            </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-[#ff8f00]/5 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <h2 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter mb-8 leading-tight">
            Ready to upgrade your life?
          </h2>
          <p className="text-xl text-[#aaabb0] mb-12">
            Bring order to the chaos and set up your dashboard in less than 5 minutes.
          </p>
          <Link href="/sign-up">
            <button className="cursor-pointer bg-gradient-to-r from-[#81ecff] via-[#00d4ec] to-[#a68cff] text-[#005762] font-black px-12 py-6 rounded-xl text-xl hover:shadow-[0_0_40px_rgba(129,236,255,0.4)] transition-all transform hover:scale-105 active:scale-95 uppercase tracking-wider">
              Start
            </button>
          </Link>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
