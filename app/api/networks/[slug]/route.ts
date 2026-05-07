import { NextResponse } from "next/server"; import { prisma } from "@/lib/prisma";
export async function GET(_:Request,{params}:{params:{slug:string}}){ const network=await prisma.network.findFirst({ where:{slug:params.slug,isApproved:true}, include:{shows:true,videos:{where:{isApproved:true}}} }); return network?NextResponse.json(network):NextResponse.json({error:'Not found'},{status:404}); }
