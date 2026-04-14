import Link from "next/link";
import { Film, Activity, CheckSquare, Calendar, Shield, Zap, Network, Rss, Home } from "lucide-react";

export default function LandingPage() {
  return (
    <>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* Decorative Glows */}
          <div className="absolute top-0 -left-20 w-96 h-96 bg-[#81ecff]/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-[#ff8f00]/10 blur-[120px] rounded-full"></div>
          <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 relative z-10">
              <h1 className="font-headline text-6xl md:text-7xl font-extrabold tracking-tighter leading-none text-[#f6f6fc]">
                Your Entire Life, <br /><span className="text-[#81ecff] italic">Integrated.</span>
              </h1>
              <p className="text-xl text-[#aaabb0] max-w-lg leading-relaxed">
                The ultimate dashboard to track your media, exercise, habits, and tasks—all in one place. Connect your digital world into a single kinetic flow.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/sign-up">
                  <button className="bg-gradient-to-br from-[#ff8f00] to-[#eb8300] text-[#462300] font-bold px-8 py-4 rounded-lg text-lg hover:shadow-[0_0_25px_rgba(255,143,0,0.3)] transition-all transform active:scale-95 hover:scale-105">
                    Get Started
                  </button>
                </Link>
                <Link href="/sign-in">
                  <button className="bg-[#23262c]/40 backdrop-blur-md border border-[#46484d]/30 text-[#f6f6fc] px-8 py-4 rounded-lg text-lg hover:bg-[#23262c]/60 transition-all hover:scale-105">
                    Sign In
                  </button>
                </Link>
              </div>
              <div className="flex items-center gap-4 pt-4 text-sm text-[#aaabb0]/60">
                <span>Made by Joseph Sutorus</span>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 glass-card p-4 rounded-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Dashboard Mockup" className="rounded-xl shadow-2xl border border-[#46484d]/20 w-full object-cover aspect-video" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKBRGdmWT0IkTsAzQnK95F3G2DuSNKe52Y1BLtV2YyIsIZkhwddEV0PQSv8GeltwmwC0AMboGQLPmOsdoTRH59hCnUx61d3YF3EhklePL4w1m2CpboF9Qm_7Kk4zB4QfhNh_M-6oL-xI3DI68xhm_tT4M1NA4pdX8h4CfFDkIDtymYHmkEQ-3D1Cu5yJ9fE9YFfrxm7zkVWGBnGm8ApgxRsyLBSYRZEfS_RrpCPMRrHWvj-Ty_J__jqwjyURTXTah0-12tG1UOYYx5" />
              </div>
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#81ecff]/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#a68cff]/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Feature Showcase */}
        <section className="py-24 bg-[#111318]/30">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-16">
              <h2 className="font-headline text-4xl font-bold tracking-tight mb-4">Master Your <span className="text-[#ff8f00]">Ecosystem</span></h2>
              <p className="text-[#aaabb0] text-lg max-w-xl">Every data point has a home. Homepage connects with the tools you already love.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Media Card */}
              <div className="glass-card p-8 rounded-2xl flex flex-col gap-6 hover:translate-y-[-8px] transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full bg-[#00e3fd]/20 flex items-center justify-center neon-glow-primary">
                  <Film className="text-[#81ecff] w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-headline text-xl font-bold">Media</h3>
                  <p className="text-[#aaabb0] text-sm leading-relaxed">Keep track of what you&apos;re watching.</p>
                </div>
              </div>
              
              {/* Exercise Card */}
              <div className="glass-card p-8 rounded-2xl flex flex-col gap-6 hover:translate-y-[-8px] transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full bg-[#8f4e00]/20 flex items-center justify-center neon-glow-secondary">
                  <Activity className="text-[#ff8f00] w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-headline text-xl font-bold">Exercise</h3>
                  <p className="text-[#aaabb0] text-sm leading-relaxed">Track your your workouts and fitness progress.</p>
                </div>
              </div>

              {/* Tasks Card */}
              <div className="glass-card p-8 rounded-2xl flex flex-col gap-6 hover:translate-y-[-8px] transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full bg-[#7c4dff]/20 flex items-center justify-center shadow-[0_0_20px_rgba(166,140,255,0.2)]">
                  <CheckSquare className="text-[#a68cff] w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-headline text-xl font-bold">Tasks</h3>
                  <p className="text-[#aaabb0] text-sm leading-relaxed">Manage your daily to-dos and stay organized with a simple, effective list.</p>
                </div>
                {/* <div className="mt-auto pt-4 border-t border-[#46484d]/10">
                  <span className="text-xs font-bold text-[#a68cff] tracking-widest uppercase">Focus Mode</span>
                </div> */}
              </div>

              {/* Habits Card */}
              <div className="glass-card p-8 rounded-2xl flex flex-col gap-6 hover:translate-y-[-8px] transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full bg-[#00e3fd]/20 flex items-center justify-center neon-glow-primary">
                  <Calendar className="text-[#81ecff] w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-headline text-xl font-bold">Habits</h3>
                  <p className="text-[#aaabb0] text-sm leading-relaxed">Log your daily mood and visualize trends over time to understand your well-being.</p>
                </div>
                {/* <div className="mt-auto pt-4 border-t border-[#46484d]/10">
                  <span className="text-xs font-bold text-[#81ecff] tracking-widest uppercase">Daily Streaks</span>
                </div> */}
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
              <div className="md:col-span-2 glass-card rounded-3xl p-10 relative overflow-hidden flex flex-col justify-end group">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e12] via-transparent to-transparent z-10"></div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Data Visualization" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuk7Y2fwmawxO3IKU9NIAtCJ1mRDnZKcijp5Zgad2fHsppd8ukpY2CdCFK5wGphUUFjYHW_pdaeKvhSTSvOJSCGYY1OC4ygJboRY_DkXaV2V7MkZern3NNmskELtGke7Yaw5HLTi41houRFuc6XHnJWcm7UaRpvfJpBq2GL3pVLN0YvPv6xfuZ29_eFV7-_ZJJsWaaXyptI_rFHxs2LXmpNp93HMxpMsykHsvoWiOxZKt_ikhli_InNz5ByCbAGsuqzKArff7sOABK" />
                <div className="relative z-20">
                  <h4 className="font-headline text-3xl font-bold mb-2">Deep Insights</h4>
                  <p className="text-[#aaabb0]">Analyze your lifestyle trends over months and years.</p>
                </div>
              </div>
              <div className="glass-card rounded-3xl p-8 flex flex-col justify-center items-center text-center bg-[#81ecff]/5">
                <Shield className="text-[#81ecff] w-12 h-12 mb-4" />
                <h4 className="font-headline text-xl font-bold mb-2">Privacy First</h4>
                <p className="text-[#aaabb0] text-sm">Your data never leaves your devices without your explicit consent.</p>
              </div>
              <div className="glass-card rounded-3xl p-8 flex flex-col justify-center items-center text-center bg-[#ff8f00]/5">
                <Zap className="text-[#ff8f00] w-12 h-12 mb-4" />
                <h4 className="font-headline text-xl font-bold mb-2">Instant Sync</h4>
                <p className="text-[#aaabb0] text-sm">Real-time updates across all your connected accounts.</p>
              </div>
              <div className="md:col-span-2 glass-card rounded-3xl p-10 flex flex-col justify-center bg-gradient-to-br from-[#171a1f] to-[#23262c]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h4 className="font-headline text-3xl font-bold mb-2">Hyper-Connected</h4>
                    <p className="text-[#aaabb0] max-w-sm">Connect APIs, RSS feeds, and smart home devices into your global control center.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0c0e12] flex items-center justify-center border border-[#46484d]/30"><Network className="w-6 h-6 text-[#aaabb0]" /></div>
                    <div className="w-12 h-12 rounded-lg bg-[#0c0e12] flex items-center justify-center border border-[#46484d]/30"><Rss className="w-6 h-6 text-[#aaabb0]" /></div>
                    <div className="w-12 h-12 rounded-lg bg-[#0c0e12] flex items-center justify-center border border-[#46484d]/30"><Home className="w-6 h-6 text-[#aaabb0]" /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-[#81ecff]/5 pointer-events-none"></div>
          <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
            <h2 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tighter mb-8 leading-tight">
              Take control of your data and your day.
            </h2>
            <p className="text-xl text-[#aaabb0] mb-12">
              Join thousands of users today and experience the clarity of a unified personal life dashboard.
            </p>
            <Link href="/sign-up">
              <button className="bg-gradient-to-r from-[#81ecff] via-[#00d4ec] to-[#a68cff] text-[#005762] font-black px-12 py-6 rounded-xl text-xl hover:shadow-[0_0_40px_rgba(129,236,255,0.4)] transition-all transform hover:scale-105 active:scale-95 uppercase tracking-wider">
                Get Started Now
              </button>
            </Link>
          </div>
        </section>
    </>
  );
}
