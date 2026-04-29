"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Link from "next/link";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  
  const callbackUrl = searchParams.get("callbackUrl") || "/home";

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else {
        setError(err.message || "Failed to send reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row font-lexend bg-media-surface text-media-on-surface antialiased selection:bg-media-secondary/20 overflow-x-hidden">
      {/* Left Side: Editorial Atmospheric Visual */}
      <section className="relative hidden md:flex md:w-1/2 lg:w-3/5 bg-media-primary overflow-hidden items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            alt="Nature Backdrop"
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxj9mJwvwnC-gPs7qhI9n0dsciA9StxG29oGlHtd_sySITLt79yitw7tSk5l91yijDbWcuozLSWF1XIYHGuh_Rp_HiubZtEEqA7J6CWQmfdvn8wbGVVzsY-qbVP_MLpSmAjpaAX4lA388_jMgT-aV5CYQjDOGHWAGs778XtNVtCw0VY99Rj2-G9jywv2UL7V_Axx7wcuM86LPoAsaUVVVS7DHWH9kYIUzaIdSrHjwbsdHruwinlOyM5opmqO4zWJWEVqTjMs5tEz4"
          />
        </div>
        <div className="relative z-10 p-12 max-w-xl">
          <div className="mb-8 overflow-hidden rounded-lg">
            <span className="inline-block py-1 px-3 bg-media-secondary text-media-on-secondary text-[10px] tracking-[0.2em] uppercase font-semibold rounded-sm mb-6">
              Established 2024
            </span>
            <h1 className="text-6xl font-bold tracking-tighter text-media-surface leading-[0.9] mb-8">
              Restore your <br />
              <span className="italic text-media-secondary-fixed">connection</span>.
            </h1>
            <p className="text-media-surface-container-high text-lg leading-relaxed font-light opacity-90 max-w-md">
              We will help you regain access to the sanctuary of the Earthbound Editorial.
            </p>
          </div>
          <div className="flex items-center gap-4 pt-8">
            <div className="h-[1px] w-12 bg-media-secondary"></div>
            <span className="text-media-surface-variant text-sm tracking-widest uppercase">
              The Editorial Archive
            </span>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-media-primary/40 to-transparent"></div>
      </section>

      {/* Right Side: Clean Form */}
      <section className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-media-surface min-h-screen relative">
        <div className="absolute top-8 left-8 lg:left-12">
          <Link href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="flex items-center gap-2 text-media-on-surface-variant hover:text-media-primary transition-colors group">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-sm font-medium uppercase tracking-widest">Back to Sign In</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-16 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-media-primary">
              Earthbound
            </Link>
          </div>

          <header className="mb-12">
            <h2 className="text-4xl font-bold tracking-tight text-media-primary mb-4">Reset Password</h2>
            <p className="text-media-on-surface-variant text-lg">Enter your email and we&apos;ll send you a link to restore your access.</p>
          </header>

          {error && (
            <div className="mb-6 rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-md bg-green-500/15 p-3">
              <p className="text-sm text-green-600 dark:text-green-400">
                Check your inbox! We&apos;ve sent a password reset link to your email.
              </p>
            </div>
          )}


          <form onSubmit={handleResetPassword} className="space-y-8">
            <div className="group relative">
              <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant mb-2 ml-1" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-4 bg-media-surface-container-low rounded-lg border-none focus:ring-0 text-media-primary placeholder:text-media-outline transition-all duration-300"
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="archivist@earthbound.com"
                  disabled={loading}
                />
                <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-media-secondary transition-all duration-500 group-focus-within:w-full"></div>
              </div>
            </div>

            <div className="pt-4">
              <button
                className="w-full py-5 bg-media-secondary text-media-on-secondary font-bold rounded-lg editorial-shadow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
                <span className="material-symbols-outlined">email</span>
              </button>
            </div>
          </form>

          <footer className="mt-16 text-center">
            <p className="text-sm text-media-on-surface-variant">
              Remember your password?{" "}
              <Link
                href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-bold text-media-primary underline underline-offset-4 decoration-media-secondary/30 hover:decoration-media-secondary transition-all"
              >
                Sign In
              </Link>
            </p>
          </footer>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-media-primary via-media-secondary to-media-primary opacity-20 pointer-events-none"></div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-media-surface flex items-center justify-center font-lexend text-media-primary">Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
