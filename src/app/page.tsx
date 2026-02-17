import Link from "next/link";

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

const metrics = [
  { label: "Published forms", value: "128" },
  { label: "Weekly responses", value: "24.6k" },
  { label: "Avg. completion", value: "91%" },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pt-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-charcoal text-ivory">
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
          <button className="rounded-full bg-charcoal px-4 py-2 text-sm text-ivory transition hover:bg-charcoal/90">
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

        <div className="rounded-3xl border border-charcoal/10 bg-sand p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-charcoal/60">Live overview</p>
              <p className="font-display text-2xl text-charcoal">
                Morning Pulse
              </p>
            </div>
            <span className="rounded-full bg-ivory px-3 py-1 text-xs text-charcoal/70">
              Active
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-charcoal/10 bg-ivory p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">
                  {metric.label}
                </p>
                <p className="mt-2 font-display text-2xl text-charcoal">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-rust">
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
        <div className="rounded-[32px] border border-charcoal/10 bg-charcoal px-8 py-10 text-ivory md:px-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ivory/60">
                Next steps
              </p>
              <h2 className="mt-2 font-display text-3xl">
                Turn this into your product.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-ivory/70">
                Swap the copy, plug in your data sources, and you are ready for
                production. This layout is intentionally minimal so you can move
                fast.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                className="rounded-full bg-ivory px-6 py-3 text-sm font-medium text-charcoal"
                href="/dashboard"
              >
                Open dashboard
              </Link>
              <button className="rounded-full border border-ivory/30 px-6 py-3 text-sm font-medium text-ivory">
                Download kit
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
