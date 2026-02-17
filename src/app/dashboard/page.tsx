import Link from "next/link";

const stats = [
  { label: "Active flows", value: "12" },
  { label: "New responses", value: "1,482" },
  { label: "Conversion", value: "86%" }
];

const activity = [
  { name: "Product feedback", status: "Live", responses: "318", updated: "2h ago" },
  { name: "Onboarding pulse", status: "Draft", responses: "64", updated: "Yesterday" },
  { name: "Partner intake", status: "Live", responses: "1,102", updated: "Feb 15" }
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal">Dashboard</p>
            <h1 className="font-display text-3xl text-charcoal">Workspace overview</h1>
            <p className="mt-2 text-sm text-charcoal/70">
              Track flows, watch completion, and refine the experience.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal/80 transition hover:border-charcoal hover:text-charcoal"
              href="/"
            >
              Back to landing
            </Link>
            <button className="rounded-full bg-charcoal px-4 py-2 text-sm text-ivory">
              New flow
            </button>
          </div>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-charcoal/10 bg-ivory p-6 shadow-soft"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-charcoal/50">{stat.label}</p>
              <p className="mt-4 font-display text-3xl text-charcoal">{stat.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 rounded-3xl border border-charcoal/10 bg-ivory p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-charcoal">Recent activity</h2>
            <button className="text-sm text-teal">View all</button>
          </div>
          <div className="mt-6 space-y-4">
            {activity.map((item) => (
              <div
                key={item.name}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-charcoal/10 bg-sand px-4 py-3"
              >
                <div>
                  <p className="font-medium text-charcoal">{item.name}</p>
                  <p className="text-xs text-charcoal/60">Updated {item.updated}</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-charcoal/70">
                  <span>{item.responses} responses</span>
                  <span className="rounded-full bg-ivory px-3 py-1 text-xs text-charcoal/70">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
