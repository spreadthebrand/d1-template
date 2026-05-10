export const dynamic = "force-dynamic";
import { NextResponse } from "next/server"; import { prisma } from "@/lib/prisma";
export async function GET(){ return NextResponse.json(await prisma.video.findMany({ where:{isApproved:true}, include:{network:true,show:true}, orderBy:{createdAt:"desc"} })); }
