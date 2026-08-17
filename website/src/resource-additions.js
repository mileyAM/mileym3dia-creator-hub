/*
 * MILEYM3DIA CREATOR HUB
 * Resource Additions
 *
 * Add new creator tools here without modifying
 * the main resource database.
 */

const additions = [
  /* ==================================================
     MUSIC
  ================================================== */

  {
    id: "splice",
    name: "Splice",
    description:
      "Royalty-free samples, presets and sounds for music production.",
    category: "music",
    subcategory: "Samples",
    pricing: {
      type: "paid"
    },
    platforms: ["web"],
    tags: ["samples", "loops", "presets", "music production"],
    website: "https://splice.com"
  },

  {
    id: "loopcloud",
    name: "Loopcloud",
    description:
      "Large searchable library of samples, loops and sounds for producers.",
    category: "music",
    subcategory: "Samples",
    pricing: {
      type: "paid"
    },
    platforms: ["windows", "mac"],
    tags: ["samples", "loops", "production"],
    website: "https://www.loopcloud.com"
  },

  {
    id: "bandlab",
    name: "BandLab",
    description:
      "Free browser-based music creation, recording and collaboration platform.",
    category: "music",
    subcategory: "DAWs",
    pricing: {
      type: "free"
    },
    platforms: ["web", "ios", "android"],
    tags: ["daw", "recording", "beats", "collaboration"],
    website: "https://www.bandlab.com"
  },

  {
    id: "soundtrap",
    name: "Soundtrap",
    description:
      "Online music studio for recording, beat making and collaboration.",
    category: "music",
    subcategory: "DAWs",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios", "android"],
    tags: ["daw", "recording", "collaboration"],
    website: "https://www.soundtrap.com"
  },

  {
    id: "native-instruments",
    name: "Native Instruments",
    description:
      "Professional instruments, effects, samples and production software.",
    category: "music",
    subcategory: "Instruments & Plugins",
    pricing: {
      type: "paid"
    },
    platforms: ["windows", "mac"],
    tags: ["plugins", "kontakt", "instruments", "effects"],
    website: "https://www.native-instruments.com"
  },

  {
    id: "arturia",
    name: "Arturia",
    description:
      "Synthesizers, virtual instruments, effects and music production hardware.",
    category: "music",
    subcategory: "Instruments & Plugins",
    pricing: {
      type: "paid"
    },
    platforms: ["windows", "mac"],
    tags: ["synthesizers", "plugins", "effects", "instruments"],
    website: "https://www.arturia.com"
  },

  {
    id: "valhalla-dsp",
    name: "Valhalla DSP",
    description:
      "Popular professional reverb and delay plugins for music producers.",
    category: "music",
    subcategory: "Mixing & Mastering",
    pricing: {
      type: "paid"
    },
    platforms: ["windows", "mac"],
    tags: ["reverb", "delay", "mixing", "mastering"],
    website: "https://valhalladsp.com"
  },

  {
    id: "voxengo",
    name: "Voxengo",
    description:
      "Audio plugins and professional mixing and mastering tools.",
    category: "music",
    subcategory: "Mixing & Mastering",
    pricing: {
      type: "freemium"
    },
    platforms: ["windows", "mac"],
    tags: ["plugins", "mixing", "mastering"],
    website: "https://www.voxengo.com"
  },

  {
    id: "landr",
    name: "LANDR",
    description:
      "Online mastering, distribution and music production services.",
    category: "music",
    subcategory: "Mastering & Distribution",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["mastering", "distribution", "music"],
    website: "https://www.landr.com"
  },

  {
    id: "distrokid",
    name: "DistroKid",
    description:
      "Music distribution platform for releasing songs to streaming services.",
    category: "music",
    subcategory: "Music Business",
    pricing: {
      type: "paid"
    },
    platforms: ["web"],
    tags: ["distribution", "spotify", "releases", "music business"],
    website: "https://www.distrokid.com"
  },

  {
    id: "tunecore",
    name: "TuneCore",
    description:
      "Independent music distribution, publishing and artist services.",
    category: "music",
    subcategory: "Music Business",
    pricing: {
      type: "paid"
    },
    platforms: ["web"],
    tags: ["distribution", "publishing", "artists"],
    website: "https://www.tunecore.com"
  },

  /* ==================================================
     VIDEO
  ================================================== */

  {
    id: "capcut",
    name: "CapCut",
    description:
      "Fast video editor for social clips, short-form content and effects.",
    category: "video",
    subcategory: "Video Editing",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "windows", "mac", "ios", "android"],
    tags: ["video editing", "shorts", "reels", "tiktok"],
    website: "https://www.capcut.com"
  },

  {
    id: "davinci-resolve",
    name: "DaVinci Resolve",
    description:
      "Professional editing, color grading, visual effects and audio production.",
    category: "video",
    subcategory: "Video Editing",
    pricing: {
      type: "freemium"
    },
    platforms: ["windows", "mac", "linux"],
    tags: ["editing", "color grading", "fusion", "fairlight"],
    website: "https://www.blackmagicdesign.com/products/davinciresolve"
  },

  {
    id: "adobe-premiere",
    name: "Adobe Premiere",
    description:
      "Professional video editing software for creators and production teams.",
    category: "video",
    subcategory: "Video Editing",
    pricing: {
      type: "paid"
    },
    platforms: ["windows", "mac"],
    tags: ["editing", "video", "production"],
    website: "https://www.adobe.com/products/premiere.html"
  },

  {
    id: "after-effects",
    name: "Adobe After Effects",
    description:
      "Motion graphics and visual effects software for advanced video work.",
    category: "video",
    subcategory: "Motion Graphics",
    pricing: {
      type: "paid"
    },
    platforms: ["windows", "mac"],
    tags: ["motion graphics", "vfx", "animation"],
    website: "https://www.adobe.com/products/aftereffects.html"
  },

  {
    id: "obs-studio",
    name: "OBS Studio",
    description:
      "Free open-source software for livestreaming and screen recording.",
    category: "video",
    subcategory: "Streaming",
    pricing: {
      type: "free"
    },
    platforms: ["windows", "mac", "linux"],
    openSource: true,
    tags: ["streaming", "recording", "youtube", "twitch"],
    website: "https://obsproject.com"
  },

  {
    id: "streamlabs",
    name: "Streamlabs",
    description:
      "Streaming tools, overlays, alerts and creator broadcasting software.",
    category: "video",
    subcategory: "Streaming",
    pricing: {
      type: "freemium"
    },
    platforms: ["windows", "mac", "web", "ios", "android"],
    tags: ["streaming", "twitch", "youtube", "overlays"],
    website: "https://streamlabs.com"
  },

  {
    id: "riverside",
    name: "Riverside",
    description:
      "High-quality remote recording platform for podcasts and video interviews.",
    category: "video",
    subcategory: "Podcasting",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios", "android"],
    tags: ["podcast", "recording", "interviews"],
    website: "https://riverside.fm"
  },

  {
    id: "descript",
    name: "Descript",
    description:
      "Edit video and podcasts by editing the transcript like a document.",
    category: "video",
    subcategory: "Podcasting",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "windows", "mac"],
    tags: ["podcast", "transcription", "video editing", "ai"],
    website: "https://www.descript.com"
  },

  {
    id: "frame-io",
    name: "Frame.io",
    description:
      "Video collaboration, review and approval platform for creative teams.",
    category: "video",
    subcategory: "Collaboration",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios"],
    tags: ["video", "review", "collaboration", "production"],
    website: "https://frame.io"
  },

  /* ==================================================
     DESIGN
  ================================================== */

  {
    id: "canva",
    name: "Canva",
    description:
      "Easy-to-use design platform for graphics, social posts and marketing.",
    category: "design",
    subcategory: "Graphic Design",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "windows", "mac", "ios", "android"],
    tags: ["design", "graphics", "social media", "templates"],
    website: "https://www.canva.com"
  },

  {
    id: "figma",
    name: "Figma",
    description:
      "Collaborative interface design and prototyping platform.",
    category: "design",
    subcategory: "UI/UX",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "windows", "mac"],
    tags: ["ui", "ux", "prototyping", "design"],
    website: "https://www.figma.com"
  },

  {
    id: "adobe-photoshop",
    name: "Adobe Photoshop",
    description:
      "Professional image editing, compositing and graphic design software.",
    category: "design",
    subcategory: "Photo Editing",
    pricing: {
      type: "paid"
    },
    platforms: ["windows", "mac", "ios"],
    tags: ["photoshop", "photo editing", "graphics"],
    website: "https://www.adobe.com/products/photoshop.html"
  },

  {
    id: "adobe-illustrator",
    name: "Adobe Illustrator",
    description:
      "Professional vector graphics software for logos and illustrations.",
    category: "design",
    subcategory: "Graphic Design",
    pricing: {
      type: "paid"
    },
    platforms: ["windows", "mac"],
    tags: ["vector", "logos", "illustration"],
    website: "https://www.adobe.com/products/illustrator.html"
  },

  {
    id: "photopea",
    name: "Photopea",
    description:
      "Browser-based image editor with support for PSD and many formats.",
    category: "design",
    subcategory: "Photo Editing",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["photoshop", "psd", "photo editing"],
    website: "https://www.photopea.com"
  },

  {
    id: "pixlr",
    name: "Pixlr",
    description:
      "Browser-based photo editing and graphic design tools.",
    category: "design",
    subcategory: "Photo Editing",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios", "android"],
    tags: ["photo editing", "design", "graphics"],
    website: "https://pixlr.com"
  },

  {
    id: "blender",
    name: "Blender",
    description:
      "Free open-source 3D creation suite for modeling, animation and rendering.",
    category: "design",
    subcategory: "3D",
    pricing: {
      type: "free"
    },
    platforms: ["windows", "mac", "linux"],
    openSource: true,
    tags: ["3d", "modeling", "animation", "rendering"],
    website: "https://www.blender.org"
  },

  {
    id: "spline",
    name: "Spline",
    description:
      "Browser-based 3D design and interactive web experiences.",
    category: "design",
    subcategory: "3D",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "mac"],
    tags: ["3d", "web", "interactive", "design"],
    website: "https://spline.design"
  },

  /* ==================================================
     AI
  ================================================== */

  {
    id: "chatgpt",
    name: "ChatGPT",
    description:
      "AI assistant for writing, research, brainstorming, coding and creator workflows.",
    category: "ai",
    subcategory: "AI Assistants",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios", "android", "mac", "windows"],
    tags: ["ai", "assistant", "writing", "research", "coding"],
    website: "https://chatgpt.com"
  },

  {
    id: "claude",
    name: "Claude",
    description:
      "AI assistant for writing, analysis, coding and long-form work.",
    category: "ai",
    subcategory: "AI Assistants",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios", "android"],
    tags: ["ai", "assistant", "writing", "coding"],
    website: "https://claude.ai"
  },

  {
    id: "gemini",
    name: "Google Gemini",
    description:
      "AI assistant for research, writing, coding and multimodal tasks.",
    category: "ai",
    subcategory: "AI Assistants",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios", "android"],
    tags: ["ai", "assistant", "research"],
    website: "https://gemini.google.com"
  },

  {
    id: "perplexity",
    name: "Perplexity",
    description:
      "AI-powered search and research engine with cited answers.",
    category: "ai",
    subcategory: "Research",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios", "android"],
    tags: ["research", "search", "ai"],
    website: "https://www.perplexity.ai"
  },

  {
    id: "midjourney",
    name: "Midjourney",
    description:
      "AI image generation platform for creative visual concepts.",
    category: "ai",
    subcategory: "AI Image",
    pricing: {
      type: "paid"
    },
    platforms: ["web"],
    tags: ["ai art", "image generation", "art"],
    website: "https://www.midjourney.com"
  },

  {
    id: "adobe-firefly",
    name: "Adobe Firefly",
    description:
      "Generative AI tools for images, graphics and creative production.",
    category: "ai",
    subcategory: "AI Image",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["generative ai", "image", "design"],
    website: "https://firefly.adobe.com"
  },

  {
    id: "runway",
    name: "Runway",
    description:
      "AI-powered video generation and creative production platform.",
    category: "ai",
    subcategory: "AI Video",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["ai video", "video generation", "effects"],
    website: "https://runwayml.com"
  },

  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description:
      "AI voice generation, narration and voice cloning platform.",
    category: "ai",
    subcategory: "AI Voice",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["voice", "text to speech", "narration", "audio"],
    website: "https://elevenlabs.io"
  },

  {
    id: "suno",
    name: "Suno",
    description:
      "AI music generation platform for creating songs and musical ideas.",
    category: "ai",
    subcategory: "AI Music",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios", "android"],
    tags: ["ai music", "songs", "music generation"],
    website: "https://suno.com"
  },

  {
    id: "udio",
    name: "Udio",
    description:
      "AI-powered music creation and song generation platform.",
    category: "ai",
    subcategory: "AI Music",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["ai music", "songs", "music generation"],
    website: "https://www.udio.com"
  },

  {
    id: "descript-ai",
    name: "Descript AI",
    description:
      "AI-powered tools for editing, transcription, voice and content production.",
    category: "ai",
    subcategory: "Creator AI",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "windows", "mac"],
    tags: ["ai", "video", "podcast", "transcription"],
    website: "https://www.descript.com"
  },

  /* ==================================================
     CREATOR BUSINESS
  ================================================== */

  {
    id: "wordpress",
    name: "WordPress",
    description:
      "Flexible website and publishing platform for creator businesses.",
    category: "creator-business",
    subcategory: "Websites",
    pricing: {
      type: "free"
    },
    platforms: ["web"],
    tags: ["website", "blog", "cms", "business"],
    website: "https://wordpress.org"
  },

  {
    id: "shopify",
    name: "Shopify",
    description:
      "Ecommerce platform for selling products, services and digital goods.",
    category: "creator-business",
    subcategory: "Ecommerce",
    pricing: {
      type: "paid"
    },
    platforms: ["web", "ios", "android"],
    tags: ["ecommerce", "store", "sales"],
    website: "https://www.shopify.com"
  },

  {
    id: "printful",
    name: "Printful",
    description:
      "Print-on-demand fulfillment for creator merchandise and ecommerce.",
    category: "creator-business",
    subcategory: "Merch",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["merch", "print on demand", "ecommerce"],
    website: "https://www.printful.com"
  },

  {
    id: "gumroad",
    name: "Gumroad",
    description:
      "Platform for selling digital products, memberships and creator content.",
    category: "creator-business",
    subcategory: "Digital Products",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["digital products", "selling", "creator business"],
    website: "https://gumroad.com"
  },

  {
    id: "ko-fi",
    name: "Ko-fi",
    description:
      "Creator support platform for memberships, donations and digital products.",
    category: "creator-business",
    subcategory: "Monetization",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["memberships", "donations", "creator income"],
    website: "https://ko-fi.com"
  },

  {
    id: "patreon",
    name: "Patreon",
    description:
      "Membership platform for creators building recurring supporter income.",
    category: "creator-business",
    subcategory: "Memberships",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios", "android"],
    tags: ["membership", "fans", "subscriptions"],
    website: "https://www.patreon.com"
  },

  {
    id: "mailchimp",
    name: "Mailchimp",
    description:
      "Email marketing platform for newsletters, campaigns and audiences.",
    category: "creator-business",
    subcategory: "Email Marketing",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios", "android"],
    tags: ["email", "newsletter", "marketing"],
    website: "https://mailchimp.com"
  },

  {
    id: "beehiiv",
    name: "beehiiv",
    description:
      "Newsletter publishing platform built for audience growth and monetization.",
    category: "creator-business",
    subcategory: "Email Marketing",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["newsletter", "email", "audience"],
    website: "https://www.beehiiv.com"
  },

  {
    id: "buffer",
    name: "Buffer",
    description:
      "Social media scheduling and publishing platform for creators and brands.",
    category: "creator-business",
    subcategory: "Social Media",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "ios", "android"],
    tags: ["social media", "scheduling", "marketing"],
    website: "https://buffer.com"
  },

  {
    id: "hootsuite",
    name: "Hootsuite",
    description:
      "Social media management, scheduling and analytics platform.",
    category: "creator-business",
    subcategory: "Social Media",
    pricing: {
      type: "paid"
    },
    platforms: ["web", "ios", "android"],
    tags: ["social media", "analytics", "scheduling"],
    website: "https://www.hootsuite.com"
  },

  {
    id: "google-analytics",
    name: "Google Analytics",
    description:
      "Website analytics and audience measurement platform.",
    category: "creator-business",
    subcategory: "Analytics",
    pricing: {
      type: "free"
    },
    platforms: ["web"],
    tags: ["analytics", "website", "traffic", "seo"],
    website: "https://analytics.google.com"
  },

  {
    id: "google-search-console",
    name: "Google Search Console",
    description:
      "Free tools for monitoring search performance and website indexing.",
    category: "creator-business",
    subcategory: "SEO",
    pricing: {
      type: "free"
    },
    platforms: ["web"],
    tags: ["seo", "google", "search", "website"],
    website: "https://search.google.com/search-console"
  },

  /* ==================================================
     DEVELOPMENT / CREATOR TECH
  ================================================== */

  {
    id: "github",
    name: "GitHub",
    description:
      "Code hosting and collaboration platform for building and deploying projects.",
    category: "creator-business",
    subcategory: "Development",
    pricing: {
      type: "freemium"
    },
    platforms: ["web", "windows", "mac"],
    tags: ["code", "github", "development", "collaboration"],
    website: "https://github.com"
  },

  {
    id: "vercel",
    name: "Vercel",
    description:
      "Deployment platform for modern websites and web applications.",
    category: "creator-business",
    subcategory: "Development",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["hosting", "deployment", "web", "development"],
    website: "https://vercel.com"
  },

  {
    id: "netlify",
    name: "Netlify",
    description:
      "Platform for deploying and hosting modern websites and web applications.",
    category: "creator-business",
    subcategory: "Development",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["hosting", "deployment", "web"],
    website: "https://www.netlify.com"
  },

  {
    id: "lovable",
    name: "Lovable",
    description:
      "AI-powered application builder for creating web apps from natural language.",
    category: "ai",
    subcategory: "AI Development",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["ai", "coding", "web apps", "development"],
    website: "https://lovable.dev"
  },

  {
    id: "bolt",
    name: "Bolt",
    description:
      "AI-powered development environment for building web applications.",
    category: "ai",
    subcategory: "AI Development",
    pricing: {
      type: "freemium"
    },
    platforms: ["web"],
    tags: ["ai", "coding", "web apps", "development"],
    website: "https://bolt.new"
  },

  {
    id: "cursor",
    name: "Cursor",
    description:
      "AI-powered code editor designed for building and modifying software.",
    category: "ai",
    subcategory: "AI Development",
    pricing: {
      type: "freemium"
    },
    platforms: ["windows", "mac", "linux"],
    tags: ["ai", "coding", "developer", "editor"],
    website: "https://www.cursor.com"
  }
];

export default additions;
