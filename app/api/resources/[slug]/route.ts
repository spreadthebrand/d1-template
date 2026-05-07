import { NextResponse } from "next/server"; import { prisma } from "@/lib/prisma";
export async function GET(_:Request,{params}:{params:{slug:string}}){ const article=await prisma.resourceArticle.findFirst({ where:{slug:params.slug,isPublished:true} }); return article?NextResponse.json(article):NextResponse.json({error:'Not found'},{status:404}); }
