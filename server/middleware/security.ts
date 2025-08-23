import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com", 
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      scriptSrc: [
        "'self'", 
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "'unsafe-eval'" // Required for Vite in development
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com", 
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", 
        "blob:",
        "https://*.supabase.co"
      ],
      connectSrc: [
        "'self'", 
        "https://api.hcaptcha.com",
        "https://*.supabase.co",
        "wss://*.supabase.co"
      ],
      frameSrc: [
        "https://hcaptcha.com", 
        "https://*.hcaptcha.com"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      ...(process.env.NODE_ENV === 'production' && { upgradeInsecureRequests: [] }),
    },
  } : false, // Disable CSP in development
  crossOriginEmbedderPolicy: false, // Allow embedding for hCaptcha
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  } : false,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
  // Additional security headers
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  ieNoOpen: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
});

// Rate limiting configurations
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 50 : 500, // More lenient in development
  message: {
    error: "Too many API requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for sensitive endpoints
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API Key validation middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  const validApiKey = process.env.API_KEY;

  if (!validApiKey) {
    // If no API key is configured, skip validation
    return next();
  }

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ 
      error: "Invalid or missing API key",
      code: "INVALID_API_KEY"
    });
  }

  next();
};

// Request signature verification middleware
export const verifyRequestSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];
  const secretKey = process.env.REQUEST_SECRET_KEY;

  if (!secretKey) {
    // If no secret key is configured, skip validation
    return next();
  }

  if (!signature || !timestamp) {
    return res.status(401).json({ 
      error: "Missing request signature or timestamp",
      code: "MISSING_SIGNATURE"
    });
  }

  // Verify timestamp is within 5 minutes
  const requestTime = parseInt(timestamp as string);
  const currentTime = Date.now();
  const timeDiff = Math.abs(currentTime - requestTime);

  if (timeDiff > 5 * 60 * 1000) { // 5 minutes
    return res.status(401).json({ 
      error: "Request timestamp expired",
      code: "EXPIRED_TIMESTAMP"
    });
  }

  // Verify signature
  const crypto = require('crypto');
  const payload = JSON.stringify(req.body) + timestamp;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ 
      error: "Invalid request signature",
      code: "INVALID_SIGNATURE"
    });
  }

  next();
};

// Request origin validation middleware
export const validateOrigin = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');
  const referer = req.get('Referer');
  
  // Skip validation for development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.DOMAIN_URL,
    'https://yourdomain.com', // Replace with your actual domain
    'https://www.yourdomain.com' // Replace with your actual domain
  ].filter(Boolean);

  // Check if origin is allowed
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ 
      error: "Origin not allowed",
      code: "INVALID_ORIGIN"
    });
  }

  // Check referer for additional security
  if (referer && !allowedOrigins.some(allowed => allowed && referer.startsWith(allowed))) {
    return res.status(403).json({ 
      error: "Invalid referer",
      code: "INVALID_REFERER"
    });
  }

  next();
};

// Enhanced input sanitization middleware
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  // Basic XSS protection - remove script tags and dangerous attributes
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/<iframe/gi, '')
        .replace(/<object/gi, '')
        .replace(/<embed/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  
  next();
};

// hCaptcha verification middleware
export const verifyCaptcha = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { captchaToken } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ error: "Captcha verification required" });
  }

  try {
    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY!,
        response: captchaToken,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }

    next();
  } catch (error) {
    console.error("Captcha verification error:", error);
    return res.status(500).json({ error: "Captcha verification error" });
  }
};

// CORS configuration
export const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL, 
        process.env.DOMAIN_URL,
        'https://yourdomain.com', // Replace with your actual domain
        'https://www.yourdomain.com' // Replace with your actual domain
      ].filter(Boolean) as string[]
    : ['http://localhost:3000', 'http://localhost:5002', 'http://127.0.0.1:5002'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-API-Key',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

// Security audit logging middleware
export const securityAuditLog = (req: Request, _res: Response, next: NextFunction) => {
  const securityEvents = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    method: req.method,
    path: req.path,
    origin: req.get('Origin'),
    referer: req.get('Referer'),
    headers: {
      'x-api-key': req.headers['x-api-key'] ? 'present' : 'missing',
      'authorization': req.headers['authorization'] ? 'present' : 'missing',
    }
  };

  // Log suspicious activities
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /exec\s*\(/i,
    /eval\s*\(/i
  ];

  const requestString = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));

  if (isSuspicious) {
    console.warn('🚨 SUSPICIOUS ACTIVITY DETECTED:', securityEvents);
  }

  // Log all API requests in production
  if (process.env.NODE_ENV === 'production' && req.path.startsWith('/api')) {
    console.log('🔍 API Request:', {
      method: req.method,
      path: req.path,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }

  next();
};