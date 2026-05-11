export type UserRole = "Owner" | "Admin" | "Team Member" | "Client";
export type PostStatus = "Draft" | "Scheduled" | "Published" | "Failed";

export const platformConfigs = [
	{ name: "Instagram", api: "Meta Instagram Graph API", status: "Needs API keys" },
	{ name: "Facebook", api: "Meta Facebook Graph API", status: "Needs API keys" },
	{ name: "TikTok", api: "TikTok Content Posting API", status: "Needs API keys" },
	{ name: "YouTube", api: "YouTube Data API", status: "Needs API keys" },
	{ name: "LinkedIn", api: "LinkedIn API", status: "Needs API keys" },
	{ name: "X", api: "X API", status: "Needs API keys" },
	{ name: "Pinterest", api: "Pinterest API", status: "Needs API keys" },
];

export const workspaces = [
	{
		name: "1 Soundvibe Studios",
		tagline: "Recording, podcasting, production, and content creation",
		colors: "Black / Gold / Ivory",
		tone: "Luxury recording studio with street-professional confidence",
		audience: "Artists, podcasters, creators, entrepreneurs",
		offer: "Studio sessions, podcast production, content packages",
		website: "https://1soundvibe.example/book",
		social: "@1soundvibestudios",
	},
	{
		name: "1 Soundvibe Connections",
		tagline: "Events, networking, and creator community campaigns",
		colors: "Charcoal / Champagne / White",
		tone: "Motivational event promoter",
		audience: "Local creatives, vendors, business owners, sponsors",
		offer: "Vibe Check Thursday promos and event partnerships",
		website: "https://1soundvibe.example/events",
		social: "@1soundvibeconnections",
	},
	{
		name: "Lafayette Taylor Music",
		tagline: "Artist rollout, releases, and fan conversion",
		colors: "Onyx / Gold / Cream",
		tone: "R&B artist, inspirational and polished",
		audience: "R&B fans, live music supporters, playlist curators",
		offer: "New music, live shows, merch, and fan club",
		website: "https://lafayettetaylor.example",
		social: "@lafayettetaylor",
	},
	{
		name: "Client Brand",
		tagline: "Flexible workspace for agency clients",
		colors: "Custom",
		tone: "Client-defined",
		audience: "Client target audience",
		offer: "Client offer",
		website: "https://client.example",
		social: "@clientbrand",
	},
];

export const tones = [
	"CEO",
	"Luxury",
	"Street but professional",
	"Motivational",
	"Funny",
	"R&B artist",
	"Recording studio",
	"Event promoter",
	"Real estate/investor",
	"Coach/consultant",
];

export const dashboardStats = [
	{ label: "Scheduled posts", value: "142", trend: "+18 this week" },
	{ label: "Published this week", value: "37", trend: "91% on time" },
	{ label: "Engagement summary", value: "8.7%", trend: "+2.1% vs last week" },
	{ label: "Leads captured", value: "64", trend: "21 booked" },
	{ label: "AI credits used", value: "3,420", trend: "6,580 remaining" },
];

export const topContent = [
	{ title: "Studio tour reel", platform: "Instagram", result: "14.8K views", score: "9.4" },
	{ title: "Vibe Check promo", platform: "TikTok", result: "311 saves", score: "8.9" },
	{ title: "Podcast clip: pricing your art", platform: "YouTube", result: "7.2K views", score: "8.4" },
];

export const scheduledPosts = [
	{ platform: "Instagram", caption: "Book your next session where the vibe matches the vision.", time: "May 12, 2026 · 10:00 AM", status: "Scheduled" as PostStatus, campaign: "Studio Booking Push" },
	{ platform: "TikTok", caption: "POV: Your demo turns into a polished record in one session.", time: "May 12, 2026 · 6:30 PM", status: "Draft" as PostStatus, campaign: "New Single Release" },
	{ platform: "Facebook", caption: "Vendor tables are open for Vibe Check Thursday.", time: "May 13, 2026 · 12:00 PM", status: "Published" as PostStatus, campaign: "Vibe Check Thursday Promo" },
	{ platform: "LinkedIn", caption: "Creators need systems, not just ideas. Here is our weekly rollout stack.", time: "May 14, 2026 · 9:00 AM", status: "Scheduled" as PostStatus, campaign: "Creator Systems" },
];

export const automationFlows = [
	{ trigger: "STUDIO", platform: "Instagram", reply: "Just sent you the booking info.", dm: "Thanks for reaching out. Here’s the booking link: [link]. What date are you looking for?", tag: "Studio Lead", active: true },
	{ trigger: "BOOK", platform: "Facebook", reply: "Check your inbox — details are on the way.", dm: "What service are you looking to book and what date works best?", tag: "Booking Intent", active: true },
	{ trigger: "VC", platform: "Instagram", reply: "Vibe Check details sent.", dm: "Here are the event details, vendor info, and ticket link: [link]", tag: "Event Lead", active: false },
	{ trigger: "QUOTE", platform: "LinkedIn", reply: "We sent the quote request form.", dm: "Tell us your goal, timeline, and budget range so we can prepare options.", tag: "Quote Request", active: true },
];

export const leads = [
	{ name: "Maya Rivers", email: "maya@example.com", phone: "337-555-0198", handle: "@mayamakesmusic", source: "Instagram", keyword: "STUDIO", service: "Recording session", status: "Booked", assigned: "Owner", followUp: "May 15, 2026" },
	{ name: "Chris D.", email: "chris@example.com", phone: "337-555-0121", handle: "@chrisdmedia", source: "TikTok", keyword: "PRICE", service: "Podcast package", status: "Contacted", assigned: "Admin", followUp: "May 13, 2026" },
	{ name: "Ari Events", email: "ari@example.com", phone: "337-555-0181", handle: "@arievents", source: "Facebook", keyword: "VC", service: "Event rental", status: "New", assigned: "Team Member", followUp: "May 12, 2026" },
];

export const linkTemplates = ["Artist", "Recording Studio", "Event Space", "Podcast", "Coach", "Small Business"];

export const campaigns = [
	{ name: "Studio Booking Push", goal: "Book 20 studio sessions", dates: "May 12–31, 2026", offer: "First-time creator bundle", frequency: "2 reels + 3 stories weekly" },
	{ name: "Vibe Check Thursday Promo", goal: "Sell 150 tickets", dates: "May 11–June 4, 2026", offer: "Early bird ticket + vendor table", frequency: "Daily stories + 4 posts weekly" },
	{ name: "New Single Release", goal: "Drive streams and saves", dates: "June 1–21, 2026", offer: "Pre-save + merch drop", frequency: "Countdown sequence" },
	{ name: "Podcast Launch", goal: "Launch with 1,000 first-week plays", dates: "June 8–30, 2026", offer: "Subscribe and guest waitlist", frequency: "Clip every weekday" },
	{ name: "Event Rental Promo", goal: "Generate qualified venue leads", dates: "May 18–June 18, 2026", offer: "Tour booking link", frequency: "3 posts weekly" },
];

export const templates = [
	"Studio promo captions",
	"Artist rollout captions",
	"Booking follow-up messages",
	"Event promo captions",
	"Podcast captions",
	"Daily quote templates",
	"Testimonial posts",
	"DM scripts",
	"Email templates",
];

export const billingPlans = [
	{ name: "Free Trial", price: "$0", features: "1 workspace, 25 AI credits, planning tools" },
	{ name: "Creator Plan", price: "$29/mo", features: "3 workspaces, 1,000 AI credits, exports" },
	{ name: "Pro Plan", price: "$79/mo", features: "10 workspaces, automation builder, team seats" },
	{ name: "Agency Plan", price: "$199/mo", features: "Unlimited clients, white-label-ready flows" },
	{ name: "Lifetime Deal", price: "$997", features: "Founders access, annual credit bundle" },
];
