import { HeroSection } from "@/components/HeroSection";
import { PricingCards } from "@/components/PricingCards";
import { defaultPlans } from "@/lib/content";
const sections = [
  ["What CCB Network Does", "Organizes creator profiles, applications, web channels, sample video links, leads, and distribution readiness."],
  ["Who It’s For", "Creators, churches, educators, podcasters, filmmakers, musicians, businesses, ministries, and community organizations."],
  ["How It Works", "Apply, shape your network profile, publish approved web content, review readiness, then scale when the business case is ready."],
  ["Launch for Free, Scale Later", "Start with web distribution and optional local uploads. Add Stripe, cloud storage, email, and TV apps later."],
  ["Distribution Roadmap", "Web first; Roku, Fire TV, Apple TV, Android TV, FAST, IPTV, and mobile apps are separate future phases."],
  ["FAQ", "Does CCB publish instantly to TV apps? No. Third-party platforms require accounts, reviews, compliance, technical work, and sometimes fees."]
];
export default function Home() { return <><HeroSection title="Launch Your Digital Network With CCB Network" subtitle="Connect, Create, & Build your own streaming presence across web, mobile, TV apps, and future distribution platforms."/><section className="section grid gap-6 md:grid-cols-2">{sections.map(([h, t]) => <article className="card" key={h}><h2 className="text-2xl font-black">{h}</h2><p className="mt-3 text-slate-300">{t}</p></article>)}</section><section className="section pt-0"><h2 className="mb-8 text-4xl font-black">Pricing Preview</h2><PricingCards plans={defaultPlans}/></section></>; }
