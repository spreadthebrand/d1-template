import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/AdminSidebar";
export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");
  if ((session.user as any).role !== "admin") redirect("/dashboard");
  return <div className="grid gap-8 lg:grid-cols-[260px_1fr]"><AdminSidebar/><div>{children}</div></div>;
}
