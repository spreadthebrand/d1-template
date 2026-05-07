export const dynamic = "force-dynamic";
import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/prisma"; import { AnalyticsCards } from "@/components/AnalyticsCards";
export default async function Admin(){ const [applications,networks,videos,leads,users]=await Promise.all([prisma.application.count(),prisma.network.count(),prisma.video.count(),prisma.lead.count(),prisma.user.count()]); return <AdminShell><><h1 className="text-4xl font-black">Admin Dashboard</h1><div className="mt-8"><AnalyticsCards stats={{ applications, networks, videos, leads, users }}/></div></></AdminShell> }
