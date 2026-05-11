export type AiRequest = {
	topic?: string;
	goal?: string;
	audience?: string;
	offer?: string;
	tone?: string;
	platform?: string;
	contentType?: string;
};

export type AiPackage = {
	instagram: string;
	tiktok: string;
	youtubeTitle: string;
	youtubeDescription: string;
	facebook: string;
	linkedin: string;
	x: string;
	email: string;
	sms: string;
	blog: string;
	hook: string;
	hashtags: string[];
	overlays: string[];
};

const clean = (value: string | undefined, fallback: string) => (value && value.trim().length > 0 ? value.trim() : fallback);

export function createMockAiPackage(request: AiRequest): AiPackage {
	const topic = clean(request.topic, "booking a premium creative session");
	const goal = clean(request.goal, "turn attention into qualified leads");
	const audience = clean(request.audience, "creators, artists, podcasters, and small business owners");
	const offer = clean(request.offer, "tap the booking link and claim your spot");
	const tone = clean(request.tone, "luxury, confident, and practical");
	const platform = clean(request.platform, "all platforms");
	const contentType = clean(request.contentType, "short-form campaign");

	return {
		instagram: `Your vision deserves more than a random post. For ${topic}, build the moment, show the proof, and invite ${audience} to ${offer}. Tone: ${tone}.`,
		tiktok: `POV: ${topic} becomes a real offer, a clean CTA, and content your audience can act on today. ${offer}.`,
		youtubeTitle: `${topic}: Turn One Idea Into A Full Content Rollout`,
		youtubeDescription: `In this ${contentType}, we break down how ${audience} can use ${topic} to ${goal}. Watch, save the checklist, then ${offer}.`,
		facebook: `We are helping ${audience} move from ideas to booked opportunities. This week’s focus is ${topic}. If you are ready to ${goal}, ${offer}.`,
		linkedin: `A strong content system turns one message into repeatable distribution. Topic: ${topic}. Goal: ${goal}. Audience: ${audience}. Next step: ${offer}.`,
		x: `${topic} is not just content — it is a conversion path. Build the hook, prove the value, make the CTA clear. ${offer}.`,
		email: `Subject: Your next move for ${topic}\n\nIf your audience already cares about the outcome, the content needs to make the next step obvious. Here is the plan: lead with the problem, show the transformation, share proof, then invite them to ${offer}.`,
		sms: `Quick reminder: ${topic} is live. If you want the next step, ${offer}.`,
		blog: `# ${topic}\n\nA modern creator campaign should not stop at one caption. Start with the core promise, adapt it for each platform, and connect every post to a measurable action. For ${audience}, the goal is to ${goal} without sounding generic or spammy.`,
		hook: `Stop posting and praying. Turn ${topic} into a system that books, sells, and grows.`,
		hashtags: ["#1Soundvibe", "#CreatorBusiness", "#ContentEngine", "#StudioLife", "#BookTheSession", "#MusicMarketing", "#SmallBusinessGrowth", "#PodcastMarketing", "#EventPromo", "#LuxuryBranding"],
		overlays: ["One idea. Ten assets.", "Turn comments into booked calls.", "Your content needs a conversion path.", `Built for ${platform}.`],
	};
}

export function repurposePackage(source: string) {
	const base = source.trim() || "Promote the offer with confidence, proof, and a clear next step.";
	return {
		captions: Array.from({ length: 5 }, (_, index) => `Caption ${index + 1}: ${base} Angle ${index + 1} — lead with value, add proof, close with a direct CTA.`),
		stories: ["Poll: What are you creating this week?", "Behind-the-scenes proof slide", "CTA slide with booking/link sticker"],
		email: `Subject: A better way to move on this\n\n${base}\n\nHere is the simple next step: reply with your goal or tap the booking link.`,
		sms: `New update: ${base.slice(0, 120)} Tap the link to continue.`,
		blog: `## Repurposed campaign plan\n\n${base}\n\nUse this as the hero idea, then split it into social proof, education, objection handling, and direct offer posts.`,
		youtube: `Use this description to connect the short-form angle to the full story: ${base}`,
		hashtags: ["#ContentRepurposing", "#CreatorTools", "#MarketingSystem", "#LeadGeneration", "#BrandGrowth", "#1Soundvibe", "#StudioMarketing", "#CampaignBuilder", "#SocialScheduler", "#ContentWorkflow"],
		ctas: ["Book your session", "Get the details", "Join the list", "Claim your spot", "Send us your goal"],
		schedule: ["Monday: Hook reel", "Tuesday: Story poll", "Wednesday: Educational post", "Thursday: Testimonial", "Friday: Direct CTA"],
	};
}
