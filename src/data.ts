export const leadStatuses = [
  "New",
  "Contacted",
  "Replied",
  "Interested",
  "Booked Tour",
  "Booked Session",
  "Not Interested",
  "Do Not Contact",
] as const;

export const roles = ["Owner", "Manager", "VA", "Sales Rep"] as const;

export const tones = [
  "Professional",
  "Street but respectful",
  "Luxury brand",
  "Friendly",
  "Direct sales",
  "Soft invite",
] as const;

export const bookingCtas = [
  "Book a studio tour",
  "Book a recording session",
  "Join membership",
  "Perform at Vibe Check Thursday",
  "Book podcast room",
];

export const demoLeads = [
  {
    id: "ld_001",
    name: "Maya Johnson",
    username: "@mayasingshtx",
    profileUrl: "https://instagram.com/mayasingshtx",
    email: "maya@example.com",
    phone: "",
    platform: "Instagram",
    source: "#houstonartist",
    tags: ["R&B", "Houston", "Warm"],
    status: "Interested",
    city: "Houston",
    bio: "R&B vocalist booking sessions and intimate live shows.",
    lastContacted: "2026-05-06",
    assignedTo: "Ari Sales",
    notes: "Asked about vocal chain and weekend availability.",
    sentiment: "Positive",
  },
  {
    id: "ld_002",
    name: "Corey Beatson",
    username: "@coreybeats",
    profileUrl: "https://instagram.com/coreybeats",
    email: "corey@example.com",
    phone: "",
    platform: "Instagram",
    source: "Competitor account commenters",
    tags: ["Producer", "Collab"],
    status: "Replied",
    city: "Houston",
    bio: "Producer. Keys, drums, and sample flips.",
    lastContacted: "2026-05-07",
    assignedTo: "Nia Manager",
    notes: "Good fit for producer collaboration night.",
    sentiment: "Neutral",
  },
  {
    id: "ld_003",
    name: "Jalen Price",
    username: "@jalenpodcasts",
    profileUrl: "https://instagram.com/jalenpodcasts",
    email: "jalen@example.com",
    phone: "",
    platform: "Instagram",
    source: "Manual CSV import",
    tags: ["Podcast", "Booking"],
    status: "New",
    city: "Sugar Land",
    bio: "Host building a weekly founder interview show.",
    lastContacted: "",
    assignedTo: "Sam VA",
    notes: "Imported from event list with consent to follow up.",
    sentiment: "Unknown",
  },
  {
    id: "ld_004",
    name: "Tasha Monroe",
    username: "@tashamonroeofficial",
    profileUrl: "https://instagram.com/tashamonroeofficial",
    email: "",
    phone: "",
    platform: "Instagram",
    source: "Vibe Check Thursday post commenters",
    tags: ["Performer", "Event"],
    status: "Booked Tour",
    city: "Houston",
    bio: "Singer-songwriter. Live set clips and studio diaries.",
    lastContacted: "2026-05-05",
    assignedTo: "Ari Sales",
    notes: "Booked a Thursday walkthrough.",
    sentiment: "Positive",
  },
];

export const demoCampaigns = [
  {
    id: "cmp_001",
    name: "Houston recording studio tour",
    type: "Studio tour invite",
    audience: "Houston artists and creators",
    step1:
      "Hey {first_name}, saw you through {source}. Your sound feels like it would fit the 1 Soundvibe rooms. Want me to send a quick studio tour link?",
    followUp1:
      "Just circling back, {first_name}. We have a few tour slots this week if you want to see the space before your next session.",
    followUp2:
      "No pressure — should I close the loop or keep you posted when tour times open up?",
    waitTime: "3 days",
    stopCondition: "Stop sequence immediately when the lead replies, opts out, or books.",
    limit: 35,
  },
  {
    id: "cmp_002",
    name: "R&B artist session invite",
    type: "Recording session offer",
    audience: "R&B singers and songwriters",
    step1:
      "Peace {first_name}, your vocals caught my attention. 1 Soundvibe has a clean setup for R&B sessions — want details on booking a session?",
    followUp1:
      "We can help with tracking, vocal production, and a comfortable room. Want me to send the booking link?",
    followUp2:
      "Last follow-up from me — if now is not the right time, I can check back later.",
    waitTime: "3 days",
    stopCondition: "Stop when the artist replies, declines, says stop, or books.",
    limit: 25,
  },
  {
    id: "cmp_003",
    name: "Producer collaboration",
    type: "Producer collaboration invite",
    audience: "Producers and beat makers",
    step1:
      "Yo {first_name}, I saw your producer work from {source}. We are connecting serious producers with artists at 1 Soundvibe — open to a collab intro?",
    followUp1: "Would a producer night or artist writing session be useful for you?",
    followUp2: "If you want, I can send the next invite when we lock the room schedule.",
    waitTime: "4 days",
    stopCondition: "Stop when the lead replies or opts out.",
    limit: 20,
  },
  {
    id: "cmp_004",
    name: "Vibe Check Thursday invite",
    type: "Vibe Check event invite",
    audience: "Performers and fans",
    step1:
      "Hey {first_name}, we host Vibe Check Thursday at 1 Soundvibe. Your energy looks like a fit — want the performer details?",
    followUp1: "Spots are limited and curated. Want me to send the signup link?",
    followUp2: "Should I keep you on the list for future Vibe Check dates?",
    waitTime: "2 days",
    stopCondition: "Stop when the lead replies, signs up, or declines.",
    limit: 30,
  },
  {
    id: "cmp_005",
    name: "Podcast room booking",
    type: "Podcast studio invite",
    audience: "Podcast hosts and video creators",
    step1:
      "Hey {first_name}, noticed your podcast work. 1 Soundvibe has a private podcast room if you ever need a clean recording setup — want the booking link?",
    followUp1: "We can support solo episodes, interviews, and short-form clips. Want to see times?",
    followUp2: "No worries if not — I can send details whenever you are ready.",
    waitTime: "3 days",
    stopCondition: "Stop when booked, replied, or opted out.",
    limit: 25,
  },
  {
    id: "cmp_006",
    name: "Membership offer",
    type: "Membership offer",
    audience: "Recurring creators",
    step1:
      "Hey {first_name}, if you are recording often, 1 Soundvibe memberships can make sessions simpler. Want the membership options?",
    followUp1: "Membership can help with room access, planning, and consistent creative workflow.",
    followUp2: "Should I send a quick breakdown or close this out?",
    waitTime: "5 days",
    stopCondition: "Stop when the lead replies, requests pricing, joins, or opts out.",
    limit: 15,
  },
];

export const approvalQueue = [
  {
    id: "msg_001",
    lead: "Maya Johnson",
    campaign: "R&B artist session invite",
    channel: "Instagram DM via approved workflow",
    draft:
      "Hey Maya, your R&B clips feel polished. 1 Soundvibe has a vocal-friendly room in Houston — want me to send a session link?",
    risk: "Low",
  },
  {
    id: "msg_002",
    lead: "Corey Beatson",
    campaign: "Producer collaboration",
    channel: "Manual DM approval",
    draft:
      "Yo Corey, your keys and drums caught our ear. We are curating producer collabs at 1 Soundvibe — open to details?",
    risk: "Low",
  },
  {
    id: "msg_003",
    lead: "Tasha Monroe",
    campaign: "Vibe Check Thursday invite",
    channel: "Instagram DM via approved workflow",
    draft:
      "Hey Tasha, your live clips have the right energy for Vibe Check Thursday. Want the performer details?",
    risk: "Low",
  },
];

export const recentActivity = [
  "Maya Johnson replied positively to R&B artist session invite.",
  "Corey Beatson draft moved to approval queue.",
  "22 duplicate Instagram usernames skipped during CSV import.",
  "Tasha Monroe booked a studio tour.",
  "Compliance system lowered today’s remaining message cap after high queue volume.",
];
