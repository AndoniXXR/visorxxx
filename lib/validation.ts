// Enhanced input validation schemas

export interface ValidationResult {
  isValid: boolean;
  sanitized?: string;
  error?: string;
}

// Enhanced tag validation
export function validateTags(tags: string): ValidationResult {
  if (!tags || typeof tags !== 'string') {
    return { isValid: true, sanitized: '' };
  }

  // Remove dangerous characters and limit length
  const sanitized = tags
    .trim()
    .slice(0, 500) // Max 500 chars
    .replace(/[<>\"'&%\\]/g, '') // Remove potentially dangerous chars
    .replace(/\s+/g, ' ') // Normalize whitespace
    .toLowerCase();

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /<script/i,
    /on\w+=/i,
    /eval\(/i,
    /expression\(/i,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(sanitized))) {
    return { isValid: false, error: 'Invalid characters detected' };
  }

  return { isValid: true, sanitized };
}

// Enhanced page validation
export function validatePage(page: string | null): ValidationResult {
  if (!page) {
    return { isValid: true, sanitized: '1' };
  }

  const pageNum = parseInt(page, 10);
  
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
    return { isValid: false, error: 'Page must be between 1 and 1000' };
  }

  return { isValid: true, sanitized: pageNum.toString() };
}

// Enhanced source validation
export function validateSource(source: string | null): ValidationResult {
  const allowedSources = ['e621', 'rule34', 'xbooru'];
  
  if (!source || !allowedSources.includes(source)) {
    return { isValid: true, sanitized: 'e621' }; // Default to e621
  }

  return { isValid: true, sanitized: source };
}

// Enhanced suggestion term validation
export function validateSuggestionTerm(term: string | null): ValidationResult {
  if (!term || typeof term !== 'string') {
    return { isValid: false, error: 'Term is required' };
  }

  const sanitized = term
    .trim()
    .slice(0, 100) // Shorter limit for suggestions
    .replace(/[<>\"'&%\\]/g, '')
    .toLowerCase();

  if (sanitized.length < 2) {
    return { isValid: false, error: 'Term must be at least 2 characters' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /<script/i,
    /on\w+=/i,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(sanitized))) {
    return { isValid: false, error: 'Invalid characters detected' };
  }

  return { isValid: true, sanitized };
}

// URL validation with enhanced security
export function validateDownloadUrl(url: string | null): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url.trim());
    
    // Only HTTPS allowed
    if (urlObj.protocol !== 'https:') {
      return { isValid: false, error: 'Only HTTPS URLs are allowed' };
    }

    // Whitelist of allowed domains
    const allowedDomains = [
      'static1.e621.net',
      'img.rule34.xxx', 
      'us.rule34.xxx',
      'api-cdn.rule34.xxx',
      'api-cdn-mp4.rule34.xxx',
      'img.xbooru.com'
    ];

    const domain = urlObj.hostname.toLowerCase();
    const isDomainAllowed = allowedDomains.some(allowedDomain => 
      domain === allowedDomain || domain.endsWith('.' + allowedDomain)
    );

    if (!isDomainAllowed) {
      return { isValid: false, error: 'Domain not allowed' };
    }

    // Check for suspicious URL patterns
    const suspiciousPatterns = [
      /localhost/i,
      /127\.0\.0\.1/,
      /0\.0\.0\.0/,
      /192\.168\./,
      /10\./,
      /172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /::1/,
      /javascript:/i,
      /data:/i,
      /file:/i,
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(url))) {
      return { isValid: false, error: 'Suspicious URL pattern detected' };
    }

    return { isValid: true, sanitized: url.trim() };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}
