const additions = [
  {
    id: "obs-studio",
    name: "OBS Studio",
    slug: "obs-studio",
    description:
      "Free open-source software for recording video and live streaming.",
    category: "video",
    subcategory: "Streaming & Recording",
    tags: ["streaming", "recording", "youtube", "twitch", "open-source"],
    pricing: {
      type: "free",
      price: 0,
      currency: "USD"
    },
    platforms: ["windows", "macos", "linux"],
    formats: [],
    website: "https://obsproject.com/",
    download: "",
    openSource: true,
    featured: true,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "audacity",
    name: "Audacity",
    slug: "audacity",
    description:
      "Free open-source audio editor and recorder for creators, musicians and podcasters.",
    category: "music",
    subcategory: "Audio Editing & Recording",
    tags: ["audio", "recording", "podcast", "editing", "open-source"],
    pricing: {
      type: "free",
      price: 0,
      currency: "USD"
    },
    platforms: ["windows", "macos", "linux"],
    formats: [],
    website: "https://www.audacityteam.org/",
    download: "",
    openSource: true,
    featured: true,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "blender",
    name: "Blender",
    slug: "blender",
    description:
      "Powerful free and open-source 3D creation suite for modeling, animation, rendering and more.",
    category: "design",
    subcategory: "3D & Animation",
    tags: ["3d", "animation", "rendering", "modeling", "open-source"],
    pricing: {
      type: "free",
      price: 0,
      currency: "USD"
    },
    platforms: ["windows", "macos", "linux"],
    formats: [],
    website: "https://www.blender.org/",
    download: "",
    openSource: true,
    featured: true,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "gimp",
    name: "GIMP",
    slug: "gimp",
    description:
      "Free open-source image editor for photo manipulation, graphics and digital artwork.",
    category: "design",
    subcategory: "Photo Editing",
    tags: ["photo", "image", "graphics", "editing", "open-source"],
    pricing: {
      type: "free",
      price: 0,
      currency: "USD"
    },
    platforms: ["windows", "macos", "linux"],
    formats: [],
    website: "https://www.gimp.org/",
    download: "",
    openSource: true,
    featured: false,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "krita",
    name: "Krita",
    slug: "krita",
    description:
      "Free open-source digital painting and illustration application.",
    category: "design",
    subcategory: "Digital Art & Illustration",
    tags: ["drawing", "painting", "illustration", "art", "open-source"],
    pricing: {
      type: "free",
      price: 0,
      currency: "USD"
    },
    platforms: ["windows", "macos", "linux"],
    formats: [],
    website: "https://krita.org/",
    download: "",
    openSource: true,
    featured: false,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "inkscape",
    name: "Inkscape",
    slug: "inkscape",
    description:
      "Free open-source vector graphics editor for logos, illustrations and scalable artwork.",
    category: "design",
    subcategory: "Vector Design",
    tags: ["vector", "logo", "svg", "illustration", "open-source"],
    pricing: {
      type: "free",
      price: 0,
      currency: "USD"
    },
    platforms: ["windows", "macos", "linux"],
    formats: [],
    website: "https://inkscape.org/",
    download: "",
    openSource: true,
    featured: false,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "vscodium",
    name: "VSCodium",
    slug: "vscodium",
    description:
      "Community-driven open-source build of Visual Studio Code.",
    category: "ai",
    subcategory: "Coding & Development",
    tags: ["coding", "development", "editor", "open-source"],
    pricing: {
      type: "free",
      price: 0,
      currency: "USD"
    },
    platforms: ["windows", "macos", "linux"],
    formats: [],
    website: "https://vscodium.com/",
    download: "",
    openSource: true,
    featured: false,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "github",
    name: "GitHub",
    slug: "github",
    description:
      "Platform for hosting code, collaborating on projects and managing software development.",
    category: "business",
    subcategory: "Development & Collaboration",
    tags: ["github", "coding", "development", "collaboration"],
    pricing: {
      type: "freemium",
      price: null,
      currency: "USD"
    },
    platforms: ["web", "windows", "macos", "linux"],
    formats: [],
    website: "https://github.com/",
    download: "",
    openSource: false,
    featured: true,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "canva",
    name: "Canva",
    slug: "canva",
    description:
      "Browser-based design platform for social graphics, presentations, thumbnails, branding and more.",
    category: "design",
    subcategory: "Graphic Design",
    tags: ["design", "social", "thumbnail", "branding", "templates"],
    pricing: {
      type: "freemium",
      price: null,
      currency: "USD"
    },
    platforms: ["web", "ios", "android"],
    formats: [],
    website: "https://www.canva.com/",
    download: "",
    openSource: false,
    featured: true,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "elevenlabs",
    name: "ElevenLabs",
    slug: "elevenlabs",
    description:
      "AI voice platform for voice generation, narration, dubbing and creator audio workflows.",
    category: "ai",
    subcategory: "Voice & Audio AI",
    tags: ["ai", "voice", "text-to-speech", "narration", "audio"],
    pricing: {
      type: "freemium",
      price: null,
      currency: "USD"
    },
    platforms: ["web"],
    formats: [],
    website: "https://elevenlabs.io/",
    download: "",
    openSource: false,
    featured: true,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "suno",
    name: "Suno",
    slug: "suno",
    description:
      "AI music creation platform for generating songs and musical ideas from prompts.",
    category: "music",
    subcategory: "AI Music",
    tags: ["ai", "music", "songwriting", "generation"],
    pricing: {
      type: "freemium",
      price: null,
      currency: "USD"
    },
    platforms: ["web"],
    formats: [],
    website: "https://suno.com/",
    download: "",
    openSource: false,
    featured: true,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "pixabay",
    name: "Pixabay",
    slug: "pixabay",
    description:
      "Large library of royalty-free images, illustrations, video and other media.",
    category: "design",
    subcategory: "Stock Media",
    tags: ["stock", "images", "video", "free", "media"],
    pricing: {
      type: "free",
      price: 0,
      currency: "USD"
    },
    platforms: ["web"],
    formats: [],
    website: "https://pixabay.com/",
    download: "",
    openSource: false,
    featured: false,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "pexels",
    name: "Pexels",
    slug: "pexels",
    description:
      "Free stock photos and videos for creators, websites and social content.",
    category: "video",
    subcategory: "Stock Media",
    tags: ["stock", "video", "photos", "free", "social"],
    pricing: {
      type: "free",
      price: 0,
      currency: "USD"
    },
    platforms: ["web"],
    formats: [],
    website: "https://www.pexels.com/",
    download: "",
    openSource: false,
    featured: false,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  },

  {
    id: "unsplash",
    name: "Unsplash",
    slug: "unsplash",
    description:
      "High-quality image library useful for websites, branding and creator projects.",
    category: "design",
    subcategory: "Stock Media",
    tags: ["photos", "images", "stock", "branding"],
    pricing: {
      type: "free",
      price: 0,
      currency: "USD"
    },
    platforms: ["web"],
    formats: [],
    website: "https://unsplash.com/",
    download: "",
    openSource: false,
    featured: false,
    verified: true,
    source: "official",
    lastVerified: "2026-08-16"
  }
];

export default additions;
