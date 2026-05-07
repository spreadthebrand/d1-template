import Link from "next/link";
const items = ["applications","networks","videos","users","pricing","leads","resources","settings","analytics"];
export function AdminSidebar() { return <aside className="card h-fit"><h2 className="font-black text-gold">Admin Console</h2><nav className="mt-5 grid gap-2 text-slate-300"><Link href="/admin" className="rounded-xl px-3 py-2 hover:bg-white/10">Overview</Link>{items.map(i => <Link key={i} href={`/admin/${i}`} className="rounded-xl px-3 py-2 capitalize hover:bg-white/10">{i}</Link>)}</nav></aside>; }
