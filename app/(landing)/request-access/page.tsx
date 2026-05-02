"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { submitAccessRequest } from "@/app/actions/access";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";

export default function RequestAccessPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<"allowed" | "denied" | "submitted" | "">("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user has already requested access in the last week
    const savedRequest = localStorage.getItem("earthbound_access_request");
    if (savedRequest) {
      try {
        const { timestamp, savedStatus } = JSON.parse(savedRequest);
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - timestamp < oneWeekMs) {
          setSuccess(true);
          setStatus(savedStatus || "submitted");
        } else {
          // Clear expired request
          localStorage.removeItem("earthbound_access_request");
        }
      } catch (e) {
        localStorage.removeItem("earthbound_access_request");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email format.");
      setLoading(false);
      return;
    }

    try {
      const res = await submitAccessRequest({ name, email, reason });
      if (res.success && res.status) {
        setSuccess(true);
        setStatus(res.status as "allowed" | "denied" | "submitted");
        // Save submission in localStorage for 7 days
        localStorage.setItem(
          "earthbound_access_request",
          JSON.stringify({ email, name, timestamp: Date.now(), savedStatus: res.status })
        );
      } else {
        setError(res.error || "Something went wrong.");
      }
    } catch (err: any) {
      console.error("Request access error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-media-background font-lexend">
      <PublicHeader />
      <main className="flex-grow text-media-on-surface antialiased">
      {/* Hero Section: Cinematic & Editorial */}
      <section className="relative w-full h-[870px] flex items-center overflow-hidden bg-media-surface-container-low">
        <div className="absolute inset-0 z-0">
          <Image
            alt="Misty forest"
            className="w-full h-full object-cover opacity-90 transition-transform duration-[10s] scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPIFVv7_t67uRYnTa7YMu9CpgQAO8HrZqT8kTkaKtr2wu8-W7ptpng6sWHZLN2XbTmJEVhhT9ofqviMbohCidGKfBfkeMdOLieNUasbk83tmngwUKOJXHb3MxsSYNS-1CBCVvKk_JUOFlxmBlca1qWC7XPjzNP13DD4smL_ZzNvUU1-911hg2LEad1jHmkNJAcryECp0eCWHLvVaBG-MjN1jPpAs2hOhT357H8yWbCO1LWyPp3IhKHtN57GyMfZ8QXiguWn0v7940"
            fill
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-media-primary/60 via-media-primary/20 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-8 md:px-16 w-full">
          <div className="max-w-2xl text-media-on-primary">
            <span className="inline-block px-4 py-1 mb-6 rounded-full border border-media-primary-fixed-dim/30 bg-media-primary/20 backdrop-blur-md text-media-primary-fixed text-xs tracking-[0.2em] font-medium uppercase">
              Invitation Only
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] mb-8">
              Homepage is currently in Private Beta
            </h1>
            <p className="text-xl md:text-2xl font-light leading-relaxed mb-12 text-media-surface-container-low/90 max-w-lg">
              A sanctuary for the modern archivist to curate a life of intention.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                className="px-10 py-5 bg-media-secondary text-media-on-secondary rounded-lg font-semibold tracking-tight text-lg hover:opacity-90 active:scale-[0.98] transition-all text-center cursor-pointer"
                href="#request-form"
              >
                Request Access
              </a>
              <Link
                className="px-10 py-5 bg-media-primary/40 backdrop-blur-md text-media-on-primary rounded-lg font-semibold tracking-tight text-lg border border-media-primary-fixed-dim/20 hover:bg-media-primary/60 active:scale-[0.98] transition-all text-center"
                href="/sign-in"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Request Form Section (Glassmorphism / Centered Focus) */}
      <section className="py-32 bg-media-surface-container" id="request-form">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <div className="bg-media-surface-bright p-10 md:p-20 rounded-2xl shadow-xl shadow-media-primary/5 border border-media-outline-variant/10">
            {success ? (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <span className="material-symbols-outlined text-media-secondary text-6xl">
                    {status === "allowed" ? "verified" : status === "denied" ? "block" : "check_circle"}
                  </span>
                </div>
                
                {status === "allowed" && (
                  <>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-media-primary mb-4">
                      Access Approved
                    </h2>
                    <p className="text-media-on-surface-variant max-w-md mx-auto leading-relaxed">
                      Your email address is already on our allowed list. You can proceed directly to the sign-in page.
                    </p>
                    <div className="pt-6">
                      <Link
                        href="/sign-in"
                        className="px-10 py-5 bg-media-secondary text-media-on-secondary rounded-lg font-semibold tracking-tight text-lg hover:opacity-90 active:scale-[0.98] transition-all inline-block"
                      >
                        Sign In
                      </Link>
                    </div>
                  </>
                )}

                {status === "denied" && (
                  <>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-media-primary mb-4">
                      Request Denied
                    </h2>
                    <p className="text-media-on-surface-variant max-w-md mx-auto leading-relaxed">
                      We regret to inform you that your request for beta access has been denied at this time.
                    </p>
                    <div className="pt-6">
                      <Link
                        href="/"
                        className="px-8 py-4 bg-media-surface-container-low text-media-primary rounded-lg font-medium tracking-wide hover:bg-media-surface-container-high transition-colors"
                      >
                        Return to Home
                      </Link>
                    </div>
                  </>
                )}

                {status === "submitted" && (
                  <>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-media-primary mb-4">
                      Request Submitted
                    </h2>
                    <p className="text-media-on-surface-variant max-w-md mx-auto leading-relaxed">
                      Thank you for your interest. Your access request has been submitted. Please come back later!
                    </p>
                    <div className="pt-6">
                      <Link
                        href="/"
                        className="px-8 py-4 bg-media-surface-container-low text-media-primary rounded-lg font-medium tracking-wide hover:bg-media-surface-container-high transition-colors"
                      >
                        Return to Home
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-media-primary mb-4">
                  Request Access
                </h2>
                <p className="text-media-on-surface-variant mb-12">
                  Entry is currently restricted to maintain the quality of the community experience. Applications are reviewed weekly.
                </p>
                
                {error && (
                  <div className="mb-6 p-4 bg-media-error-container text-media-on-error-container rounded-lg text-sm font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-semibold text-media-on-surface-variant pl-1">
                        Full Name
                      </label>
                      <input
                        className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline"
                        placeholder="Elias Thorne"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-semibold text-media-on-surface-variant pl-1">
                        Email Address
                      </label>
                      <input
                        className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline"
                        placeholder="elias@editorial.com"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest font-semibold text-media-on-surface-variant pl-1">
                      Why do you wish to join?
                    </label>
                    <textarea
                      className="w-full bg-media-surface-container-low border-none rounded-lg p-4 focus:ring-0 focus:bg-media-surface-container-high transition-colors text-media-primary placeholder:text-media-outline resize-none"
                      placeholder="Share your vision for your personal archive..."
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <button
                    className="w-full py-5 bg-media-secondary text-media-on-secondary rounded-lg font-bold text-lg hover:opacity-90 active:scale-[0.99] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </button>
                </form>
                <p className="mt-8 text-xs text-media-outline italic">
                  By requesting access, you agree to our curated community standards.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  );
}
