// Email placeholder. TODO: configure EMAIL_PROVIDER and EMAIL_API_KEY for application receipts, admin notices, approvals, and onboarding sequences.
export async function sendEmail(input: { to: string; subject: string; text: string }) { console.log("Email disabled in MVP", input.subject); return { queued: false }; }
