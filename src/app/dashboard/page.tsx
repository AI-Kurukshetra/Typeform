"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type FormRow = {
  id: string;
  title: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [forms, setForms] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setEmail(data.session.user.email ?? null);
      setUserId(data.session.user.id);

      const { data: formsData, error: formsError } = await supabase
        .from("forms")
        .select("id,title,created_at")
        .eq("user_id", data.session.user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (formsError) {
        setError(formsError.message);
      } else {
        setForms(formsData ?? []);
      }

      setLoading(false);
    };

    load();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId || !title.trim()) return;

    setCreating(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("forms")
      .insert({ title: title.trim(), user_id: userId })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setCreating(false);
      return;
    }

    setTitle("");
    setCreating(false);
    setShowCreate(false);

    router.push(`/forms/${data.id}/edit`);
  };

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!aiPrompt.trim()) return;

    setGenerating(true);
    setAiError(null);

    const sessionData = await supabase.auth.getSession();
    const accessToken = sessionData.data.session?.access_token;

    if (!accessToken) {
      setAiError("Session expired. Please log in again.");
      setGenerating(false);
      return;
    }

    const response = await fetch("/api/generate-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ prompt: aiPrompt.trim() })
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setAiError(payload?.error ?? "Failed to generate form.");
      setGenerating(false);
      return;
    }

    const payload = await response.json();
    setGenerating(false);
    setAiPrompt("");

    if (payload?.formId) {
      router.push(`/forms/${payload.formId}/edit`);
    } else {
      setAiError("No form returned.");
    }
  };

  const formCount = useMemo(() => forms.length, [forms]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-6">
          <div className="rounded-3xl border border-charcoal/10 bg-ivory px-6 py-4 text-sm text-charcoal/70 shadow-soft">
            Loading workspace...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal">Dashboard</p>
            <h1 className="font-display text-3xl text-charcoal">Your forms</h1>
            <p className="mt-2 text-sm text-charcoal/70">
              {formCount} forms · Signed in as {email ?? ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal/80 transition hover:border-charcoal hover:text-charcoal"
              href="/"
            >
              Back home
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full bg-charcoal px-4 py-2 text-sm text-ivory"
            >
              Log out
            </button>
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-charcoal/10 bg-ivory p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-charcoal">Recent forms</h2>
              <button
                onClick={() => setShowCreate((prev) => !prev)}
                className="rounded-full bg-teal px-4 py-2 text-sm text-ivory"
              >
                Create form
              </button>
            </div>

            {showCreate && (
              <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-3">
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Form title"
                  className="rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition focus:border-teal"
                  required
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={creating}
                    className="rounded-full bg-charcoal px-5 py-2 text-sm text-ivory transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="rounded-full border border-charcoal/20 px-5 py-2 text-sm text-charcoal/80"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {error && <p className="mt-4 text-sm text-rust">{error}</p>}

            <div className="mt-6 space-y-3">
              {forms.length === 0 && (
                <div className="rounded-2xl border border-dashed border-charcoal/20 bg-sand px-4 py-6 text-sm text-charcoal/60">
                  No forms yet. Create your first conversational flow.
                </div>
              )}
              {forms.map((form) => (
                <Link
                  key={form.id}
                  href={`/forms/${form.id}/edit`}
                  className="flex items-center justify-between rounded-2xl border border-charcoal/10 bg-sand px-4 py-4 transition hover:border-charcoal/30"
                >
                  <div>
                    <p className="font-medium text-charcoal">{form.title}</p>
                    <p className="text-xs text-charcoal/60">
                      Created {new Date(form.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-teal">Edit</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-charcoal/10 bg-ivory p-6 shadow-soft">
              <p className="text-xs uppercase tracking-[0.3em] text-teal">Generate with AI</p>
              <h3 className="mt-3 font-display text-2xl text-charcoal">
                Start with a prompt.
              </h3>
              <p className="mt-2 text-sm text-charcoal/70">
                Describe the form you want to build and we will draft the questions.
              </p>
              <form onSubmit={handleGenerate} className="mt-4 space-y-3">
                <textarea
                  value={aiPrompt}
                  onChange={(event) => setAiPrompt(event.target.value)}
                  placeholder="e.g. A short onboarding survey for new customers"
                  rows={4}
                  className="w-full rounded-2xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none transition focus:border-teal"
                  required
                />
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full rounded-xl bg-charcoal px-4 py-3 text-sm font-medium text-ivory transition hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {generating ? "Generating..." : "Generate form"}
                </button>
              </form>
              {aiError && <p className="mt-3 text-sm text-rust">{aiError}</p>}
            </div>

            <div className="rounded-3xl border border-charcoal/10 bg-sand p-6 shadow-soft">
              <p className="text-xs uppercase tracking-[0.3em] text-rust">Tip</p>
              <h3 className="mt-3 font-display text-2xl text-charcoal">
                Keep it conversational.
              </h3>
              <p className="mt-3 text-sm text-charcoal/70">
                Short questions with direct answers increase completion. Use the editor to
                order questions and test the flow before you publish.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
