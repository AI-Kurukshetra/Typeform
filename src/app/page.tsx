"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type FormRow = {
  id: string;
  title: string;
  created_at: string;
};

type ResponseRow = {
  id: string;
  form_id: string;
};

const features = [
  {
    title: "Flow-based building",
    description:
      "Compose forms with logic, branching, and the feel of a product walkthrough.",
  },
  {
    title: "Signal-rich analytics",
    description:
      "See completion drop-offs, time-to-submit, and friction in a glance.",
  },
  {
    title: "Design tokens",
    description:
      "Ship consistent forms using shared color, type, and motion presets.",
  },
];

export default function Home() {
  const [forms, setForms] = useState<FormRow[]>([]);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) {
        setLoading(false);
        return;
      }

      const { data: formsData, error: formsError } = await supabase
        .from("forms")
        .select("id,title,created_at")
        .eq("user_id", data.session.user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (formsError) {
        setLoading(false);
        return;
      }

      const safeForms = formsData ?? [];
      setForms(safeForms);

      if (safeForms.length > 0) {
        const { data: responseData } = await supabase
          .from("responses")
          .select("id,form_id")
          .in(
            "form_id",
            safeForms.map((form) => form.id)
          );

        if (!mounted) return;
        setResponses(responseData ?? []);
      } else {
        setResponses([]);
      }

      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const formCount = useMemo(() => forms.length, [forms]);
  const responseCount = useMemo(() => responses.length, [responses]);
  const responseCountsByForm = useMemo(() => {
    const counts = new Map<string, number>();
    for (const response of responses) {
      counts.set(response.form_id, (counts.get(response.form_id) ?? 0) + 1);
    }
    return counts;
  }, [responses]);

  const recentForms = useMemo(() => forms.slice(0, 5), [forms]);

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal text-ivory">
            TF
          </span>
          <span className="font-display text-xl tracking-tight">
            Typeform Studio
          </span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-charcoal/70 md:flex">
          <span className="hover:text-charcoal">Product</span>
          <span className="hover:text-charcoal">Templates</span>
          <span className="hover:text-charcoal">Pricing</span>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            className="rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal/80 transition hover:border-charcoal hover:text-charcoal"
            href="/dashboard"
          >
            View dashboard
          </Link>
          <button className="rounded-full bg-teal px-4 py-2 text-sm text-ivory transition hover:bg-teal/90">
            Get started
          </button>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-16 pt-12 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.3em] text-teal">
            New release
          </p>
          <h1 className="font-display text-4xl leading-tight text-charcoal md:text-5xl">
            Build forms that feel like conversations.
          </h1>
          <p className="max-w-xl text-lg text-charcoal/70">
            Launch new ideas faster with a production-ready Next.js foundation
            tuned for clean design, rapid iteration, and measurable outcomes.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-full bg-teal px-6 py-3 text-sm font-medium text-ivory shadow-soft transition hover:bg-teal/90">
              Start a workspace
            </button>
            <button className="rounded-full border border-charcoal/20 px-6 py-3 text-sm font-medium text-charcoal/80 transition hover:border-charcoal hover:text-charcoal">
              Watch demo
            </button>
          </div>
          <div className="flex flex-wrap gap-8 text-sm text-charcoal/70">
            <span>Designed for teams</span>
            <span>Analytics-ready</span>
            <span>Vercel optimized</span>
          </div>
        </div>

        <div className="rounded-3xl border border-sand bg-ivory p-6 shadow-soft">
          <p className="text-sm text-mist">Workspace snapshot</p>
          <p className="mt-1 font-display text-2xl text-charcoal">
            Your live metrics
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-sand bg-cedar p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-mist">Total forms</p>
              <p className="mt-2 font-display text-2xl text-charcoal">{formCount}</p>
            </div>
            <div className="rounded-2xl border border-sand bg-cedar p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-mist">
                Total responses
              </p>
              <p className="mt-2 font-display text-2xl text-charcoal">{responseCount}</p>
            </div>
          </div>
          {!loading && forms.length === 0 && (
            <p className="mt-6 text-sm text-mist">
              Sign in to see your workspace insights.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal">
              Recent forms
            </p>
            <h2 className="font-display text-3xl text-charcoal">
              Latest conversations.
            </h2>
          </div>
          <Link
            className="rounded-full border border-sand px-4 py-2 text-sm text-charcoal/80 transition hover:border-mist"
            href="/dashboard"
          >
            View dashboard
          </Link>
        </div>
        <div className="mt-8 space-y-3">
          {recentForms.length === 0 && (
            <div className="rounded-2xl border border-dashed border-sand bg-cedar px-4 py-6 text-sm text-mist">
              No forms yet. Create your first conversational flow.
            </div>
          )}
          {recentForms.map((form) => (
            <Link
              key={form.id}
              href={`/forms/${form.id}/edit`}
              className="flex items-center justify-between rounded-2xl border border-sand bg-cedar px-4 py-4 transition hover:border-mist"
            >
              <div>
                <p className="font-medium text-charcoal">{form.title}</p>
                <p className="text-xs text-mist">
                  Created {new Date(form.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase tracking-[0.2em] text-teal">
                  Edit
                </span>
                <p className="mt-1 text-xs text-mist">
                  {responseCountsByForm.get(form.id) ?? 0} responses
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal">
              Toolkit
            </p>
            <h2 className="font-display text-3xl text-charcoal">
              Everything you need to ship.
            </h2>
          </div>
          <p className="max-w-md text-sm text-charcoal/70">
            From routing to styling, the stack is wired for clarity. Plug in
            your product logic and deploy to Vercel in minutes.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-charcoal/10 bg-ivory p-6 shadow-soft"
            >
              <h3 className="font-display text-xl text-charcoal">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm text-charcoal/70">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="rounded-[32px] border border-charcoal/10 bg-ivory px-8 py-10 text-charcoal md:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">
                Next steps
              </p>
              <h2 className="mt-2 font-display text-3xl">
                Turn this into your product.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-charcoal/70">
                Swap the copy, plug in your data sources, and you are ready for
                production. This layout is intentionally minimal so you can move
                fast.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                className="rounded-full bg-teal px-6 py-3 text-sm font-medium text-ivory transition hover:bg-teal/90"
                href="/dashboard"
              >
                Open dashboard
              </Link>
              <button className="rounded-full border border-charcoal/20 px-6 py-3 text-sm font-medium text-charcoal/80">
                Download kit
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
