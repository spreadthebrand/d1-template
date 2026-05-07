import Link from "next/link";
type Article = { slug: string; title: string; excerpt: string; category: string };
export function ResourceCard({ article }: { article: Article }) { return <Link href={`/resources/${article.slug}`} className="card block hover:border-electric/50"><p className="text-xs font-bold uppercase tracking-widest text-gold">{article.category}</p><h3 className="mt-2 text-2xl font-black">{article.title}</h3><p className="mt-3 text-slate-300">{article.excerpt}</p></Link>; }
