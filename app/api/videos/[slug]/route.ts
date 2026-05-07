import { NextResponse } from "next/server"; import { prisma } from "@/lib/prisma";
export async function GET(_:Request,{params}:{params:{slug:string}}){ const video=await prisma.video.findFirst({ where:{slug:params.slug,isApproved:true}, include:{network:true,show:true} }); return video?NextResponse.json(video):NextResponse.json({error:"Not found"},{status:404}); }
