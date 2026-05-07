import { NextResponse } from "next/server"; import { prisma } from "@/lib/prisma";
export async function GET(){ return NextResponse.json(await prisma.network.findMany({ where:{isApproved:true,status:{not:"archived"}}, include:{owner:{include:{creatorProfile:true}}}, orderBy:{createdAt:"desc"} })); }
