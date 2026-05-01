"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { auth } from "@/lib/firebase/client";
import Link from "next/link";
import { TreeRingLoader } from "@/components/ui/tree-ring-loader";

function SignUpContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();


  const callbackUrl = searchParams.get("callbackUrl") || "/home";

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Create user with Firebase
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (name) {
        await updateProfile(credential.user, { displayName: name });
      }

      // Send verification email
      await sendEmailVerification(credential.user);

      setVerificationSent(true);
      setLoading(false);
    } catch (err: any) {

      console.error("Sign up error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError(err.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (err: any) {
      console.error("Google sign up error:", err);
      setError(err.message || "Failed to sign up with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col lg:flex-row font-lexend bg-media-surface text-media-on-surface antialiased overflow-x-hidden">
      {/* Split-Screen Image Section */}
      <section className="relative hidden h-screen w-full lg:flex lg:w-1/2 bg-media-primary overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-media-primary/20 to-transparent"></div>
        <img
          alt="Atmospheric forest"
          className="h-full w-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKYmMsbPz7YQNhCqnohvfSwzYYq92MM54sjDeyWxSCKYwkDVGJ1g03iA6sJdiPyCVELGyz8HXaDoe0cG7A_VbI03THeR_1HWnWlsxmcoD2B9EVAmCd2FckvfpljeKZBrRfp5QagJkwV7aS3m3OwSVDSoGkI1VcPijURhQPsOwbdmCQmSAnGYani36pT2H0uQ3OQ59ficW8pHucoGPlNFmPtedMSfqaIZfJoxgCq5831CvvGkwt7StYCiZXGrSdFq-_uBMAq8ta0C0"
        />
        <div className="absolute bottom-16 left-16 z-20 max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-8 text-media-primary">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <span className="text-media-primary font-bold text-xl tracking-tight">Earthbound</span>
          </div>
          <h2 className="text-media-primary text-4xl font-bold leading-tight tracking-tight mb-4">
            The sanctuary for those who belong to the wild.
          </h2>
          <p className="text-media-primary/80 text-lg leading-relaxed">
            Join an international guild dedicated to the preservation and silent exploration of our planet&apos;s remaining wonders.
          </p>
        </div>
      </section>

      {/* Split-Screen Form Section */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-16 lg:px-24 bg-media-surface relative min-h-screen">
        <div className="w-full max-w-[440px] relative">
          {/* Back Button Navigation */}
          <div className="md:absolute md:-top-16 md:-left-12 lg:-left-20 mb-8 md:mb-0">
            <Link href={callbackUrl} className="flex items-center gap-2 text-media-on-surface-variant hover:text-media-primary transition-colors group">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span className="text-sm font-medium uppercase tracking-widest">Back</span>
            </Link>
          </div>

          {/* Header */}
          <header className="mb-10">
            <h1 className="text-media-primary text-4xl font-bold leading-tight tracking-tighter mb-3">
              Create your sanctuary account
            </h1>
            <p className="text-media-on-surface-variant text-base leading-relaxed">
              Begin your journey into the Earthbound Editorial. Already have an account?{" "}
              <Link href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-media-secondary font-bold hover:underline underline-offset-4 ml-1">
                Sign In
              </Link>
            </p>
          </header>

          {verificationSent ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="mb-6 flex justify-center">
                <span className="material-symbols-outlined text-6xl text-green-500">mark_email_unread</span>
              </div>
              <h2 className="text-3xl font-bold text-media-primary mb-4">Verify your email</h2>
              <p className="text-media-on-surface-variant text-base leading-relaxed mb-8">
                We&apos;ve sent a verification link to <strong className="text-media-primary">{email}</strong>. Please check your inbox and click the link to activate your account.
              </p>
              <Link
                href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="inline-flex items-center justify-center h-14 px-8 bg-media-secondary text-media-on-secondary font-bold text-base rounded-lg hover:opacity-90 transition-all cursor-pointer"
              >
                Proceed to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 rounded-md bg-destructive/15 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleEmailSignUp} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-media-on-surface-variant ml-1">Full Name</label>
                  <div className="relative">
                    <input
                      className="w-full h-14 px-5 bg-media-surface-container-low rounded-lg border-0 focus:ring-0 focus:bg-media-surface-container-high transition-all text-media-on-surface placeholder:text-media-outline-variant text-base"
                      placeholder="Julian Thorne"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-media-secondary transition-all duration-300 peer-focus:w-full"></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-media-on-surface-variant ml-1">Email Address</label>
                  <div className="relative">
                    <input
                      className="w-full h-14 px-5 bg-media-surface-container-low rounded-lg border-0 focus:ring-0 focus:bg-media-surface-container-high transition-all text-media-on-surface placeholder:text-media-outline-variant text-base"
                      placeholder="julian@earthbound.com"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-media-on-surface-variant ml-1">Secure Password</label>
                  <div className="relative">
                    <input
                      className="w-full h-14 px-5 bg-media-surface-container-low rounded-lg border-0 focus:ring-0 focus:bg-media-surface-container-high transition-all text-media-on-surface placeholder:text-media-outline-variant text-base"
                      placeholder="••••••••••••"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-media-on-surface-variant cursor-pointer"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-media-on-surface-variant ml-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      className="w-full h-14 px-5 bg-media-surface-container-low rounded-lg border-0 focus:ring-0 focus:bg-media-surface-container-high transition-all text-media-on-surface placeholder:text-media-outline-variant text-base"
                      placeholder="••••••••••••"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      minLength={6}
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-media-on-surface-variant cursor-pointer"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <span className="material-symbols-outlined">
                        {showConfirmPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    className="kinetic-hover w-full h-14 bg-media-secondary text-media-on-secondary font-bold text-base rounded-lg editorial-shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                  >
                    <span>{loading ? "Creating..." : "Create Account"}</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </form>

              {/* Social Provider Integration */}
              <div className="mt-12 text-center relative">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-media-surface-container-high"></div>
                </div>
                <div className="relative flex justify-center text-sm uppercase tracking-[0.2em]">
                  <span className="bg-media-surface px-4 text-media-outline">Or join with</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4">
                <button
                  onClick={handleGoogleSignUp}
                  disabled={loading}
                  className="kinetic-hover flex items-center justify-center gap-3 h-12 rounded-lg bg-media-surface-container text-media-on-surface font-bold text-xs uppercase tracking-widest cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="size-4" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.14-1.92 4.16-1.12 1.12-2.8 2.34-5.92 2.34-4.82 0-8.76-3.86-8.76-8.68s3.94-8.68 8.76-8.68c2.6 0 4.6 1.02 6.02 2.38l2.32-2.32C18.84 1.34 15.9 0 12.48 0 6.1 0 0 5.1 0 12s6.1 12 12.48 12c3.48 0 6.1-1.14 8.12-3.26 2.1-2.1 2.76-5.06 2.76-7.44 0-.68-.06-1.34-.18-1.98h-10.74z"
                      fill="currentColor"
                    />
                  </svg>
                  Google
                </button>
              </div>
            </>
          )}


          <footer className="mt-16 text-center text-xs text-media-on-surface-variant leading-relaxed opacity-60">
            By joining Earthbound, you agree to our <Link href="/guidelines" className="underline">Editorial Integrity Guidelines</Link> and <Link href="/privacy" className="underline">Privacy Covenant</Link>. Our commitment is to the land and the digital footprint we leave upon it.
          </footer>
        </div>
      </section>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-media-surface flex items-center justify-center"><TreeRingLoader size={80} /></div>}>
      <SignUpContent />
    </Suspense>
  );
}
