import { HeroSection } from "@/components/HeroSection";
import { CTASection } from "@/components/CTASection";
import { PricingCards } from "@/components/PricingCards";
import { defaultPlans } from "@/lib/content";
const sections = [
  ["What CCB Network Does", "CCB Network helps creators organize a professional web streaming presence, collect leads, submit sample content, and prepare a measured roadmap for future connected-TV distribution."],
  ["Who It’s For", "Creators, ministries, coaches, educators, podcasters, musicians, filmmakers, local businesses, and community organizations who need a credible launch path without pretending every TV app is instant."],
  ["How It Works", "Apply, shape your network profile, publish approved web videos, learn what assets are missing, and scale when your audience, content rights, budget, and compliance plan are ready."],
  ["Launch for Free, Scale Later", "The MVP supports web listings, video links, local development uploads, and dashboards first. Stripe, cloud storage, email automation, and TV apps are opt-in integrations later."],
  ["Distribution Roadmap", "Start with web distribution; prepare for Roku, Fire TV, Apple TV, Android TV, mobile apps, YouTube syndication, podcasts, FAST, and IPTV as separate future phases."],
  ["Featured Network Categories", "Faith and ministry, education, wellness, indie film, music, community news, entrepreneurship, youth programming, podcasts, and branded learning channels."],
  ["FAQ", "Does this publish instantly to Roku? No. CCB Network begins with web launch readiness and roadmap planning; third-party platforms may require separate developer accounts, approvals, fees, and technical compliance."]
];
export default function Home() { return <><HeroSection title="Launch Your Digital Network With CCB Network" subtitle="Connect, Create, & Build your own streaming presence across web, mobile, TV apps, and future distribution platforms."/><section className="section grid gap-6 md:grid-cols-2">{sections.map(([h,t]) => <article key={h} className="card"><h2 className="text-2xl font-black">{h}</h2><p className="mt-3 text-slate-300">{t}</p></article>)}</section><section className="section pt-0"><h2 className="mb-8 text-4xl font-black">Pricing Preview</h2><PricingCards plans={defaultPlans}/></section><CTASection title="Build the network before buying the tower." text="Start web-first, collect the right assets, and move toward TV distribution only when the foundation is ready."/></>; }
