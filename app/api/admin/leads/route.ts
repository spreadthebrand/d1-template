import { NextResponse } from "next/server"; import { prisma } from "@/lib/prisma"; import { requireRole } from "@/lib/apiAuth";
export async function GET(){ const auth=await requireRole("admin"); if(auth.error) return auth.error; return NextResponse.json(await (prisma as any).lead.findMany({ take:100, orderBy:{createdAt:"desc"} })); }
