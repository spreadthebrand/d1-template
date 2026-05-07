import Link from "next/link";
export function DashboardSidebar() { return <aside className="card h-fit"><h2 className="font-black text-gold">Creator Studio</h2><nav className="mt-5 grid gap-2 text-slate-300">{["Dashboard","Profile","Networks","Videos","Checklist"].map(i => <Link key={i} href="/dashboard" className="rounded-xl px-3 py-2 hover:bg-white/10">{i}</Link>)}</nav></aside>; }
