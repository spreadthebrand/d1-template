import Link from "next/link";

const envGroups = [
  {
    title: "Required for first deploy",
    items: ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL", "ADMIN_EMAIL", "ADMIN_PASSWORD"]
  },
  {
    title: "Optional launch-mode integrations",
    items: ["STORAGE_PROVIDER", "S3_*", "STRIPE_*", "EMAIL_*", "ROKU_*", "FIRETV_*", "APPLE_*", "ANDROID_TV_*"]
  }
];

const githubUrl = "https://github.com/toptierprnews-source/ccb-worldwide.git";
const vercelDeployUrl = "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftoptierprnews-source%2Fccb-worldwide.git&project-name=ccb-worldwide&repository-name=ccb-worldwide";

const steps = [
  "Use the GitHub repository at toptierprnews-source/ccb-worldwide and push the latest code before deployment.",
  "Create a PostgreSQL database with Neon, Supabase, Railway, Render, Vercel Postgres, or another managed provider.",
  "Import toptierprnews-source/ccb-worldwide into Vercel or another Next.js host as a Next.js project, not as a Workers/D1 template.",
  "Add the environment variables from .env.example in the hosting dashboard.",
  "Deploy the app, then run prisma migrate deploy and npm run prisma:seed once from your workstation or CI.",
  "Sign in at /admin/login with the configured admin account and replace all seeded credentials before public launch."
];

export default function DeployPage() {
  return (
    <section className="section">
      <p className="font-bold uppercase tracking-[.25em] text-gold">Deploy CCB Network</p>
      <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight md:text-6xl">Deploy the web-first streaming MVP to production</h1>
      <p className="mt-6 max-w-3xl text-xl text-slate-300">
        CCB Network is deploy-ready for a standard Next.js host such as Vercel, Netlify, Render, Railway, or Cloudflare Pages. It is not a Cloudflare Workers/D1 app. The production app needs PostgreSQL and secure environment variables; paid integrations remain optional until you enable them.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a className="btn-primary" href={vercelDeployUrl} target="_blank" rel="noreferrer">Deploy this GitHub repo</a>
        <a className="btn-secondary" href={githubUrl} target="_blank" rel="noreferrer">View GitHub</a>
        <Link className="btn-secondary" href="/apply">Launch a Network</Link>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="card">
          <h2 className="text-3xl font-black">Production deployment steps</h2>
          <ol className="mt-6 space-y-4 text-slate-300">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-electric font-black text-white">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="grid gap-6">
          {envGroups.map((group) => (
            <article key={group.title} className="card">
              <h2 className="text-2xl font-black text-gold">{group.title}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <code key={item} className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">{item}</code>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="card mt-8 border-gold/30">
        <h2 className="text-2xl font-black">Important production note</h2>
        <p className="mt-3 text-slate-300">
          Deploying this website publishes the CCB Network web platform only. Roku, Fire TV, Apple TV, Android TV, mobile app, FAST, IPTV, and paid subscription launches are future roadmap phases that may require separate accounts, approvals, fees, testing, and platform compliance.
        </p>
      </div>
    </section>
  );
}
