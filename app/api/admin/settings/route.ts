export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"; import { prisma } from "@/lib/prisma"; import { requireRole } from "@/lib/apiAuth";
export async function GET(){ const auth=await requireRole("admin"); if(auth.error) return auth.error; return NextResponse.json(await prisma.siteSetting.findMany({orderBy:{createdAt:"desc"}})); }
export async function PATCH(req:Request){ const auth=await requireRole("admin"); if(auth.error) return auth.error; const body=await req.json(); return NextResponse.json(await prisma.siteSetting.upsert({ where:{key:body.key}, create:{key:body.key,value:body.value ?? {}}, update:{value:body.value ?? {}} })); }
