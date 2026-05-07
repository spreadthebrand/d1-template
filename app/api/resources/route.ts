import { NextResponse } from "next/server"; import { prisma } from "@/lib/prisma";
export async function GET(){ return NextResponse.json(await prisma.resourceArticle.findMany({ where:{isPublished:true}, orderBy:{createdAt:"desc"} })); }
