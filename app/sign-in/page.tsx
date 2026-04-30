"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Link from "next/link";

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const callbackUrl = searchParams.get("callbackUrl") || "/home";

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in with Firebase
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      // Exchange Firebase token for Auth.js session
      const response = await fetch("/api/auth/firebase-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          idToken, 
          refreshToken: credential.user.refreshToken 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      // Redirect to callbackUrl
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const idToken = await credential.user.getIdToken();

      // Exchange Firebase token for Auth.js session
      const response = await fetch("/api/auth/firebase-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          idToken, 
          refreshToken: credential.user.refreshToken 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      // Redirect to callbackUrl
      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message || "Failed to sign in with Google");
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
        {/* Floating Content Card */}
        <div className="relative z-10 p-12 max-w-xl">
          <div className="mb-8 overflow-hidden rounded-lg">
            <span className="inline-block py-1 px-3 bg-media-secondary text-media-on-secondary text-[10px] tracking-[0.2em] uppercase font-semibold rounded-sm mb-6">
              Established 2024
            </span>
            <h1 className="text-6xl font-bold tracking-tighter text-media-surface leading-[0.9] mb-8">
              The art of <br />
              <span className="italic text-media-secondary-fixed">intentional</span> living.
            </h1>
            <p className="text-media-surface-container-high text-lg leading-relaxed font-light opacity-90 max-w-md">
              Earthbound is a curated editorial sanctuary for those who seek depth in simplicity and rhythm in nature.
            </p>
          </div>
          <div className="flex items-center gap-4 pt-8">
            <div className="h-[1px] w-12 bg-media-secondary"></div>
            <span className="text-media-surface-variant text-sm tracking-widest uppercase">
              The Editorial Archive
            </span>
          </div>
        </div>
        {/* Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-media-primary/40 to-transparent"></div>
      </section>

      {/* Right Side: Clean Login Form */}
      <section className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 bg-media-surface min-h-screen relative">
        {/* Back Button Navigation */}
        <div className="absolute top-8 left-8 lg:left-12">
          <Link href={callbackUrl} className="flex items-center gap-2 text-media-on-surface-variant hover:text-media-primary transition-colors group">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-sm font-medium uppercase tracking-widest">Back</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Brand Anchor */}
          <div className="mb-16 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-media-primary">
              Earthbound
            </Link>
            <Link
              href="/support"
              className="text-sm font-medium text-media-on-surface-variant hover:text-media-secondary transition-colors duration-300"
            >
              Support
            </Link>
          </div>

          {/* Form Header */}
          <header className="mb-12">
            <h2 className="text-4xl font-bold tracking-tight text-media-primary mb-4">Welcome back</h2>
            <p className="text-media-on-surface-variant text-lg">Continue your journey through the editorial landscape.</p>
          </header>

          {error && (
            <div className="mb-6 rounded-md bg-destructive/15 p-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-8">
            <div className="space-y-6">
              {/* Email Field */}
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

              {/* Password Field */}
              <div className="group relative">
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-xs font-bold uppercase tracking-widest text-media-on-surface-variant" htmlFor="password">
                    Password
                  </label>
                  <Link
                    href={`/forgot-password?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                    className="text-[10px] font-bold uppercase tracking-widest text-media-secondary hover:opacity-80 transition-opacity"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    className="w-full px-4 py-4 bg-media-surface-container-low rounded-lg border-none focus:ring-0 text-media-primary placeholder:text-media-outline transition-all duration-300"
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={loading}
                    minLength={6}
                  />
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-media-secondary transition-all duration-500 group-focus-within:w-full"></div>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-media-on-surface-variant hover:text-media-primary cursor-pointer"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-3">
              <input
                className="w-5 h-5 rounded border-none bg-media-surface-container text-media-secondary focus:ring-offset-background focus:ring-media-secondary/20"
                id="remember"
                name="remember"
                type="checkbox"
              />
              <label className="text-sm text-media-on-surface-variant cursor-pointer select-none" htmlFor="remember">
                Stay signed in for 30 days
              </label>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4">
              <button
                className="w-full py-5 bg-media-secondary text-media-on-secondary font-bold rounded-lg editorial-shadow hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In to Platform"}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              <div className="relative py-4 flex items-center">
                <div className="flex-grow border-t border-media-surface-variant"></div>
                <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-widest text-media-outline">
                  Or via partner identity
                </span>
                <div className="flex-grow border-t border-media-surface-variant"></div>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="flex items-center justify-center gap-3 py-4 bg-media-surface-container rounded-lg font-semibold text-media-primary hover:bg-media-surface-container-high transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="currentColor"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="currentColor"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="text-sm">Google</span>
                </button>
              </div>
            </div>
          </form>

          {/* Footer Text */}
          <footer className="mt-16 text-center">
            <p className="text-sm text-media-on-surface-variant">
              New to the sanctuary?{" "}
              <Link
                href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-bold text-media-primary underline underline-offset-4 decoration-media-secondary/30 hover:decoration-media-secondary transition-all"
              >
                Create an account
              </Link>
            </p>
            <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-media-outline">
              <Link href="/privacy" className="hover:text-media-primary">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-media-primary">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-media-primary">
                Cookies
              </Link>
            </div>
          </footer>
        </div>
      </section>

      {/* Global Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-media-primary via-media-secondary to-media-primary opacity-20 pointer-events-none"></div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-media-surface flex items-center justify-center font-lexend text-media-primary">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
