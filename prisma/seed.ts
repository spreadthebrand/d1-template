import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../lib/utils";
import { defaultPlans, resourceSeeds } from "../lib/content";
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@ccbnetwork.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const admin = await prisma.user.upsert({ where:{email:adminEmail}, update:{}, create:{ name:"CCB Admin", email:adminEmail, role:"admin", passwordHash:await bcrypt.hash(adminPassword,12) } });
  const creators = await Promise.all(["Avery Brooks","Mia Carter","Jordan Ellis"].map(async (name,i)=>prisma.user.upsert({ where:{email:`creator${i+1}@ccbnetwork.local`}, update:{}, create:{ name, email:`creator${i+1}@ccbnetwork.local`, role:"creator", passwordHash:await bcrypt.hash("Creator123!",12), creatorProfile:{ create:{ fullName:name, organization:["Beacon House Media","Northstar Learning Lab","Indie Signal Films"][i], bio:"Fictional seed creator for the CCB Network MVP.", website:"https://example.com" } } } })));
  const categories = ["Faith & Ministry","Education","Indie Film","Wellness","Music","Community Business"];
  const networks = [];
  for (let i=0;i<6;i++) {
    const name = ["Beacon Streams","Northstar Academy TV","Indie Signal Channel","Whole Life Studio","Gold Note Sessions","Main Street Stories"][i];
    const network = await prisma.network.upsert({ where:{slug:slugify(name)}, update:{}, create:{ ownerId:creators[i%3].id, name, slug:slugify(name), description:`${name} is a fictional CCB Network seed channel designed to demonstrate approved web-first distribution, creator profiles, shows, videos, and future TV app readiness planning.`, category:categories[i], targetAudience:"Niche communities seeking purposeful streaming content.", status:i%3===0?"distribution_ready":i%3===1?"live":"building", distributionGoals:"Web launch first, then evaluate connected-TV and syndication requirements.", monetizationGoals:"Sponsors, memberships, donations, and future subscriptions.", websiteUrl:"https://example.com", isApproved:true, isFeatured:i<3, distributionChecklist:{ create:{ hasBranding:true, hasContentLibrary:i<4, hasTrailer:i<3, hasRightsConfirmation:true, hasMonetizationPlan:i<5, hasAudienceStrategy:true, hasPrivacyPolicy:i<3, hasTerms:i<3, isReadyForReview:i<2 } } } });
    networks.push(network);
    await prisma.show.upsert({ where:{slug:`${network.slug}-flagship`}, update:{}, create:{ networkId:network.id, title:`${name} Flagship`, slug:`${network.slug}-flagship`, description:"A fictional flagship show for seed data and UI testing.", category:categories[i], isApproved:true } });
  }
  for (let i=0;i<12;i++) {
    const n = networks[i%networks.length];
    await prisma.video.upsert({ where:{slug:`sample-episode-${i+1}`}, update:{}, create:{ networkId:n.id, title:`Sample Episode ${i+1}`, slug:`sample-episode-${i+1}`, description:"Original fictional seed video metadata for demonstrating the CCB Network watch experience, approval workflow, and analytics counters.", videoUrl:"https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnailUrl:null, duration:600+i*30, category:n.category, viewCount:i*17, isApproved:true, isFeatured:i<4 } });
  }
  for (const [i,p] of defaultPlans.entries()) await prisma.pricingPlan.upsert({ where:{slug:slugify(p.name)}, update:{}, create:{...p, slug:slugify(p.name), sortOrder:i} });
  for (const title of resourceSeeds) await prisma.resourceArticle.upsert({ where:{slug:slugify(title)}, update:{}, create:{ title, slug:slugify(title), excerpt:`A practical original CCB Network guide: ${title.toLowerCase()}.`, content:`<p>This original CCB Network resource explains ${title.toLowerCase()} in a web-first launch model.</p><p>Begin by clarifying your audience, content rights, production workflow, publishing cadence, and measurable goals. Use affordable tools first, then consider paid hosting, subscriptions, sponsors, cloud storage, or connected-TV app development when the economics support it.</p><p>Remember that third-party TV platforms can require developer accounts, fees, technical packaging, quality assurance, compliance, and approval. A strong web channel gives you a safer foundation before expanding.</p>`, category:"Launch Education", isPublished:true } });
  for (let i=0;i<10;i++) { await prisma.application.create({ data:{ fullName:`Applicant ${i+1}`, email:`applicant${i+1}@example.com`, phone:"555-0100", organization:`Fictional Org ${i+1}`, networkName:`Future Network ${i+1}`, networkCategory:categories[i%categories.length], targetAudience:"Local and online communities", contentDescription:"A fictional application describing owned educational and inspirational video programming for launch review.", currentPlatforms:"YouTube and social clips", websiteSocialLinks:"https://example.com", sampleVideoUrl:"https://www.youtube.com/watch?v=dQw4w9WgXcQ", monetizationGoals:"Sponsors and donations", distributionGoals:"Start web-first, prepare for TV apps later", budgetRange:i<3?"Free starter":"Builder", timeline:"30-90 days", rightsConfirmation:true, status:i%3===0?"approved":i%3===1?"pending":"rejected" } }); await prisma.lead.create({ data:{ name:`Lead ${i+1}`, email:`lead${i+1}@example.com`, phone:"555-0199", source:"seed", interest:"Distribution planning", message:"Fictional lead for admin dashboard testing.", status:i%4===0?"qualified":i%4===1?"contacted":i%4===2?"new":"closed" } }); }
  await prisma.siteSetting.upsert({ where:{key:"launchMode"}, update:{}, create:{key:"launchMode", value:{ mode:"free_mvp", stripe:false }} });
  console.log({ admin: admin.email, creators: creators.length, networks: networks.length });
}
main().finally(()=>prisma.$disconnect());
