// Security Configuration for CRM PMG
export const SECURITY_CONFIG = {
  // JWT Configuration
  JWT: {
    ACCESS_TOKEN_EXPIRY: '15m', // 15 minutes
    REFRESH_TOKEN_EXPIRY: '7d',  // 7 days
    ALGORITHM: 'HS256',
  },
  
  // Rate Limiting
  RATE_LIMITING: {
    LOGIN: {
      WINDOW_MS: 15 * 60 * 1000, // 15 minutes
      MAX_ATTEMPTS: 5, // 5 attempts
      BLOCK_DURATION: 15 * 60 * 1000, // 15 minutes block
    },
    API: {
      WINDOW_MS: 60 * 1000, // 1 minute
      MAX_REQUESTS: 100, // 100 requests per minute
    },
  },
  
  // Password Policy
  PASSWORD_POLICY: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    FORBIDDEN_PATTERNS: [
      'password',
      '123456',
      'qwerty',
      'admin',
      'user',
    ],
  },
  
  // CSP Configuration
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'font-src': ["'self'"],
    'connect-src': ["'self'", "https://*.supabase.co"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
  
  // Security Headers
  HEADERS: {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': '', // Generated from CSP config
  },
  
  // Input Validation
  INPUT_VALIDATION: {
    EMAIL: {
      MAX_LENGTH: 254,
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 100,
      PATTERN: /^[a-zA-ZÀ-ÿ\s'-]+$/,
    },
  },
  
  // API Security
  API: {
    MAX_REQUEST_SIZE: '10mb',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },
};

// Password validation function
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const config = SECURITY_CONFIG.PASSWORD_POLICY;
  
  if (password.length < config.MIN_LENGTH) {
    errors.push(`Senha deve ter pelo menos ${config.MIN_LENGTH} caracteres`);
  }
  
  if (password.length > config.MAX_LENGTH) {
    errors.push(`Senha deve ter no máximo ${config.MAX_LENGTH} caracteres`);
  }
  
  if (config.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (config.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (config.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (config.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  const lowerPassword = password.toLowerCase();
  config.FORBIDDEN_PATTERNS.forEach(pattern => {
    if (lowerPassword.includes(pattern)) {
      errors.push(`Senha não pode conter "${pattern}"`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Email validation function
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const config = SECURITY_CONFIG.INPUT_VALIDATION.EMAIL;
  
  if (email.length > config.MAX_LENGTH) {
    return { isValid: false, error: 'Email muito longo' };
  }
  
  if (!config.PATTERN.test(email)) {
    return { isValid: false, error: 'Email inválido' };
  }
  
  return { isValid: true };
};

// Generate CSP header
export const generateCSPHeader = (): string => {
  const csp = SECURITY_CONFIG.CSP;
  const directives = Object.entries(csp)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
  
  return directives;
};

// Sanitize input data
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

// Check if URL is safe for SSRF prevention
export const isSafeUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    const allowedProtocols = ['http:', 'https:'];
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254'];
    
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return false;
    }
    
    if (blockedHosts.includes(parsedUrl.hostname)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};
