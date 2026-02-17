"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session) {
        router.replace("/dashboard");
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/dashboard");
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage("Check your inbox for the magic link.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-charcoal/10 bg-ivory p-8 shadow-soft">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-teal">Supabase</p>
            <h1 className="font-display text-3xl text-charcoal">Log in with magic link</h1>
            <p className="mt-2 text-sm text-charcoal/70">
              Enter your email and we will send you a secure login link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm text-charcoal/70" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition focus:border-teal"
              placeholder="you@company.com"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-charcoal px-4 py-3 text-sm font-medium text-ivory transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Sending magic link..." : "Send magic link"}
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-teal">{message}</p>}
          {error && <p className="mt-4 text-sm text-rust">{error}</p>}

          <div className="mt-6 flex items-center justify-between text-xs text-charcoal/60">
            <span>Need help? Check spam folder.</span>
            <Link className="text-teal" href="/">
              Back home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
