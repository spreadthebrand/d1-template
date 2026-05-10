export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"; import { prisma } from "@/lib/prisma"; import { requireRole } from "@/lib/apiAuth";
export async function PATCH(req:Request){ const auth=await requireRole("creator"); if(auth.error) return auth.error; const body=await req.json(); const profile=await prisma.creatorProfile.upsert({ where:{userId:auth.session!.user!.id!}, update:body, create:{ userId:auth.session!.user!.id!, fullName:body.fullName ?? auth.session!.user!.name ?? "Creator", ...body } }); return NextResponse.json(profile); }
