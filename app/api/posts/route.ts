import { NextRequest } from "next/server";
import axios from "axios";
import { validateTags, validatePage, validateSource } from "@/lib/validation";

// Function to validate and clean URLs
function validateUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Remove any extra whitespace
    url = url.trim();
    
    // Check if it's a valid URL format
    const urlObj = new URL(url);
    
    // Only allow HTTPS for security
    if (urlObj.protocol !== 'https:') {
      return null;
    }
    
    // Whitelist of allowed domains
    const allowedDomains = [
      'e621.net', 'static1.e621.net',
      'rule34.xxx', 'img.rule34.xxx', 'us.rule34.xxx', 'api-cdn.rule34.xxx', 'api-cdn-mp4.rule34.xxx',
      'xbooru.com', 'img.xbooru.com'
    ];
    
    const domain = urlObj.hostname.toLowerCase();
    const isDomainAllowed = allowedDomains.some(allowedDomain => 
      domain === allowedDomain || domain.endsWith('.' + allowedDomain)
    );
    
    if (!isDomainAllowed) {
      return null;
    }
    
    return url;
  } catch {
    return null;
  }
}

// Function to categorize tags for sources that don't have pre-categorized tags
function categorizeTags(tags: string[], knownArtists: string[] = []) {
  const categories = {
    artist: knownArtists,
    character: [] as string[],
    copyright: [] as string[],
    general: [] as string[],
    meta: [] as string[]
  };

  const characterPatterns = [
    /_(character|char)$/,
    /^(mario|sonic|pikachu|link|zelda|samus|kirby)/i,
    // Add more known character patterns
  ];

  const copyrightPatterns = [
    /_(series|franchise|game|anime|manga)$/,
    /^(pokemon|nintendo|sega|disney|marvel|dc_comics)/i,
    /_(studios?|games?|entertainment)$/,
  ];

  const metaPatterns = [
    /^\d{4}$/, // years like 2024
    /^(absurd_res|hi_res|digital_media|digital_drawing|digital_art)/,
    /_(artwork|media|drawing|painting|sketch)$/,
    /^(colored|shaded|lighting|portrait)/,
    /^(commission|request|gift|trade)/,
  ];

  tags.forEach(tag => {
    if (knownArtists.includes(tag)) {
      return; // Already in artist category
    } else if (characterPatterns.some(pattern => pattern.test(tag))) {
      categories.character.push(tag);
    } else if (copyrightPatterns.some(pattern => pattern.test(tag))) {
      categories.copyright.push(tag);
    } else if (metaPatterns.some(pattern => pattern.test(tag))) {
      categories.meta.push(tag);
    } else {
      categories.general.push(tag);
    }
  });

  return categories;
}

const SOURCES = {
  e621: {
    url: "https://e621.net/posts.json",
    map: (post: any) => ({
      id: post.id,
      source: "e621",
      file_url: validateUrl(post.file?.url) || '',
      preview_url: validateUrl(post.preview?.url) || validateUrl(post.sample?.url) || validateUrl(post.file?.url) || '',
      sample_url: validateUrl(post.sample?.url) || validateUrl(post.file?.url) || '',
      tags: [
        ...post.tags.general,
        ...post.tags.species,
        ...post.tags.character,
        ...post.tags.copyright,
        ...post.tags.artist,
        ...post.tags.meta,
      ],
      tagCategories: {
        artist: post.tags.artist || [],
        character: post.tags.character || [],
        copyright: post.tags.copyright || [],
        general: [...(post.tags.general || []), ...(post.tags.species || [])],
        meta: post.tags.meta || []
      },
      artists: post.tags.artist || [],
      rating: post.rating,
      width: post.file?.width || 0,
      height: post.file?.height || 0,
      created_at: post.created_at,
      score: post.score?.total || 0,
      description: post.description || "",
    }),
    params: (tags: string, page: number) => ({
      tags,
      page,
      limit: 20,
    }),
    headers: {
      'User-Agent': 'dark-post-viewer/1.0 (by user on GitHub Copilot)'
    }
  },
  rule34: {
    url: "https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1",
    map: async (post: any) => {
      const tags = post.tags.split(" ");
      let artists: string[] = [];
      
      // First check if there's an explicit artist field
      if (post.artist) {
        artists.push(post.artist);
      } else {
        // Look for common artist patterns in tags (names that might be artists)
        // Usually artist names are at the beginning or contain specific patterns
        const potentialArtists = tags.filter((tag: string) => {
          // Skip common non-artist tags
          const nonArtistPatterns = [
            /^\d+(boy|girl)s?$/, // 1boy, 2girls, etc.
            /^(solo|duo|group)$/, // common count tags
            /^(rating|score|id)/, // metadata tags
            /^(breasts?|ass|penis|pussy|anal|oral|vaginal)/, // anatomy tags
            /^(big_|small_|huge_|tiny_)/, // size modifiers
            /^(female|male|futa|intersex)$/, // gender tags
            /^(explicit|questionable|safe)$/, // rating tags
            /^(blonde|brown|black|red|blue|green|purple|pink|white)_/, // color tags
            /_(hair|eyes|fur|skin)$/, // appearance tags
            /^(clothed|nude|naked)$/, // clothing state
            /^(standing|sitting|lying|kneeling)$/, // poses
            /^(looking_at_viewer|eyes_closed)$/, // expressions
          ];
          
          // Skip if matches any non-artist pattern
          if (nonArtistPatterns.some(pattern => pattern.test(tag.toLowerCase()))) {
            return false;
          }
          
          // Look for artist-like patterns (usually shorter names, often contain underscores)
          return tag.length >= 3 && tag.length <= 20 && !tag.includes('_') || 
                 (tag.includes('_') && tag.split('_').length <= 3);
        }).slice(0, 3); // Only check first 3 potential artists
        
        // For now, add the most likely artist candidates
        // This is a heuristic approach - in a real app you'd want a proper artist database
        artists = potentialArtists.slice(0, 2);
      }
      
      return {
        id: post.id,
        source: "rule34",
        file_url: validateUrl(post.file_url) || '',
        preview_url: validateUrl(post.preview_url) || validateUrl(post.sample_url) || validateUrl(post.file_url) || '',
        sample_url: validateUrl(post.sample_url) || validateUrl(post.file_url) || '',
        tags: tags,
        tagCategories: categorizeTags(tags, artists),
        artists: artists,
        rating: post.rating || "",
        width: parseInt(post.width) || 0,
        height: parseInt(post.height) || 0,
        created_at: post.created_at || "",
        score: parseInt(post.score) || 0,
        description: post.tags,
      };
    },
    params: (tags: string, page: number) => ({
      tags,
      pid: page - 1,
      limit: 20,
      json: 1,
    }),
    headers: {}
  },
  xbooru: {
    url: "https://xbooru.com/index.php?page=dapi&s=post&q=index&json=1",
    map: async (post: any) => {
      const tags = post.tags.split(" ");
      let artists: string[] = [];
      
      // First check if there's an explicit artist field
      if (post.artist) {
        artists.push(post.artist);
      } else {
        // Look for common artist patterns in tags
        const potentialArtists = tags.filter((tag: string) => {
          // Skip common non-artist tags
          const nonArtistPatterns = [
            /^\d+(boy|girl)s?$/, // 1boy, 2girls, etc.
            /^(solo|duo|group)$/, // common count tags
            /^(rating|score|id)/, // metadata tags
            /^(breasts?|ass|penis|pussy|anal|oral|vaginal)/, // anatomy tags
            /^(big_|small_|huge_|tiny_)/, // size modifiers
            /^(female|male|futa|intersex)$/, // gender tags
            /^(explicit|questionable|safe)$/, // rating tags
            /^(blonde|brown|black|red|blue|green|purple|pink|white)_/, // color tags
            /_(hair|eyes|fur|skin)$/, // appearance tags
            /^(clothed|nude|naked)$/, // clothing state
            /^(standing|sitting|lying|kneeling)$/, // poses
            /^(looking_at_viewer|eyes_closed)$/, // expressions
          ];
          
          // Skip if matches any non-artist pattern
          if (nonArtistPatterns.some(pattern => pattern.test(tag.toLowerCase()))) {
            return false;
          }
          
          // Look for artist-like patterns
          return tag.length >= 3 && tag.length <= 20 && !tag.includes('_') || 
                 (tag.includes('_') && tag.split('_').length <= 3);
        }).slice(0, 3);
        
        artists = potentialArtists.slice(0, 2);
      }
      
      return {
        id: post.id,
        source: "xbooru",
        file_url: validateUrl(post.file_url) || '',
        preview_url: validateUrl(post.preview_url) || validateUrl(post.sample_url) || validateUrl(post.file_url) || '',
        sample_url: validateUrl(post.sample_url) || validateUrl(post.file_url) || '',
        tags: tags,
        tagCategories: categorizeTags(tags, artists),
        artists: artists,
        rating: post.rating || "",
        width: parseInt(post.width) || 0,
        height: parseInt(post.height) || 0,
        created_at: post.created_at || "",
        score: parseInt(post.score) || 0,
        description: post.tags,
      };
    },
    params: (tags: string, page: number) => ({
      tags,
      pid: page - 1,
      limit: 20,
      json: 1,
    }),
    headers: {}
  },
};

// Function to apply filter to tags
function applyFilter(tags: string, filter: string): string {
  let finalTags = tags;

  switch (filter) {
    case "popularToday":
      // Add popular tags for today - score based on recent popularity
      finalTags = tags ? `${tags} score:>100 date:today` : "score:>100 date:today";
      break;
    case "popularByPage":
      // Add popular tags for this page/search - higher score threshold
      finalTags = tags ? `${tags} score:>50` : "score:>50";
      break;
    case "popularAllTime":
      // Add popular tags for all time - very high score threshold
      finalTags = tags ? `${tags} score:>200` : "score:>200";
      break;
    case "none":
    default:
      // No filter applied
      break;
  }

  return finalTags;
}

// Simple rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Function to check rate limit
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;
  
  const key = ip;
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false;
  }
  
  current.count++;
  return true;
}

// Function to sanitize input
function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 500) // Limit length
    .replace(/[<>\"'&]/g, ''); // Remove potentially dangerous characters
}

export async function GET(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { 
      status: 429,
      headers: { 
        "Content-Type": "application/json",
        "Retry-After": "900", // 15 minutes
        "X-Content-Type-Options": "nosniff"
      }
    });
  }

  const { searchParams } = new URL(req.url);
  
  // Enhanced validation
  const sourceValidation = validateSource(searchParams.get("source"));
  const tagsValidation = validateTags(searchParams.get("tags") || "");
  const pageValidation = validatePage(searchParams.get("page"));
  
  if (!sourceValidation.isValid || !tagsValidation.isValid || !pageValidation.isValid) {
    return new Response(JSON.stringify({ 
      error: "Invalid input parameters",
      details: [
        !sourceValidation.isValid && sourceValidation.error,
        !tagsValidation.isValid && tagsValidation.error,
        !pageValidation.isValid && pageValidation.error
      ].filter(Boolean)
    }), { 
      status: 400,
      headers: { 
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff" 
      }
    });
  }

  const source = sourceValidation.sanitized as keyof typeof SOURCES;
  const tags = tagsValidation.sanitized!;
  const page = parseInt(pageValidation.sanitized!);
  const filter = searchParams.get("filter") || "none";

  if (!SOURCES[source]) {
    return new Response(JSON.stringify({ error: "Invalid source" }), { 
      status: 400,
      headers: { 
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff" 
      }
    });
  }

  try {
    const { url, params, map, headers } = SOURCES[source];
    const filteredTags = applyFilter(tags, filter);
    const { data } = await axios.get(url, {
      params: params(filteredTags, page),
      headers: {
        ...headers,
        'Accept': 'application/json'
      },
      timeout: 10000, // 10 second timeout
      maxContentLength: 10 * 1024 * 1024, // 10MB max response
    });
    const posts = Array.isArray(data.posts) ? data.posts : data;
    // Handle async mapping
    const mapped = await Promise.all(posts.map(map));
    // Filter out posts without valid preview URLs
    const validPosts = mapped.filter(post => 
      post.preview_url && 
      post.preview_url !== '' && 
      (post.file_url || post.sample_url)
    );
    return new Response(JSON.stringify(validPosts), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Cache-Control": "public, max-age=300", // 5 minute cache
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
      },
    });
  } catch (e: any) {
    // No error 500: responde con posts vacíos y mensaje claro
    console.error('[API ERROR]', { source, tags, page, error: e.message });
    return new Response(JSON.stringify({ error: "No se encontraron resultados o la fuente está temporalmente no disponible", posts: [] }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Content-Type-Options": "nosniff"
      }
    });
  }
}
