export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"; import { prisma } from "@/lib/prisma"; import { requireRole } from "@/lib/apiAuth";
export async function PATCH(req:Request,{params}:{params:{id:string}}){ const auth=await requireRole("admin"); if(auth.error) return auth.error; return NextResponse.json(await prisma.network.update({where:{id:params.id},data:await req.json()})); }
