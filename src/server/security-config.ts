/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT Systems - Centralized Security Configuration
 *
 * All security-related constants and policies in one auditable location.
 * Changing any value here affects the entire application's security posture.
 */

export const SECURITY = {
  /** Session configuration */
  session: {
    /** Session cookie max age (30 days in seconds) */
    maxAgeSeconds: 30 * 24 * 60 * 60,
    /** Absolute session lifetime - force re-auth regardless (90 days) */
    absoluteMaxAgeMs: 90 * 24 * 60 * 60 * 1000,
    /** Idle timeout - destroy sessions inactive for this long (7 days) */
    idleTimeoutMs: 7 * 24 * 60 * 60 * 1000,
    /** Interval for cleaning up expired sessions (1 hour) */
    pruneIntervalMs: 60 * 60 * 1000,
  },

  /** Rate limiting */
  rateLimit: {
    /** Global rate limit per IP */
    global: { max: 100, timeWindow: '1 minute' },
    /** Auth route rate limit per IP */
    auth: { max: 10, timeWindow: '1 minute' },
    /** AI-calling endpoints (Together AI budget protection) */
    ai: { max: 10, timeWindow: '1 minute' },
    /** Image/heavy AI endpoints */
    aiHeavy: { max: 5, timeWindow: '1 minute' },
  },

  /** Brute force protection */
  bruteForce: {
    /** Max failed login attempts before lockout */
    maxAttempts: 5,
    /** Lockout duration after max attempts (15 minutes) */
    lockoutMs: 15 * 60 * 1000,
    /** Number of different emails from same IP to flag as credential stuffing */
    credentialStuffingThreshold: 5,
  },

  /** Email verification codes */
  emailCode: {
    /** How long a verification code is valid (10 minutes) */
    validMinutes: 10,
    /** Code length (digits) */
    length: 6,
  },

  /** Password/secret requirements */
  secrets: {
    /** Minimum JWT secret length */
    minJwtSecretLength: 32,
    /** Session token entropy (bytes) */
    sessionTokenBytes: 32,
    /** Email verification token entropy (bytes) */
    emailTokenBytes: 16,
  },

  /** Cookie configuration */
  cookie: {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    /** secure flag is automatically set based on NODE_ENV */
  },

  /** Request body limits */
  bodyLimits: {
    /** Default max request body size (1 MB) */
    default: 1_048_576,
    /** Max size for file uploads (if ever added) */
    upload: 10_485_760, // 10 MB
  },

  /** Vulnerability scan patterns to detect and block */
  scanPatterns: [
    '/wp-admin', '/wp-login', '/.env', '/phpinfo', '/phpmyadmin',
    '/admin/login', '/actuator', '/.git/config', '/xmlrpc.php',
    '/wp-content', '/vendor/', '/graphql', '/debug', '/trace', '/console',
  ],

  /** Backup configuration */
  backup: {
    /** Encryption algorithm */
    algorithm: 'AES-256-CBC',
    /** PBKDF2 iterations for key derivation */
    pbkdf2Iterations: 100_000,
    /** Default retention for local backups (days) */
    localRetentionDays: 30,
    /** Default retention for encrypted off-site backups (days) */
    offsiteRetentionDays: 90,
    /** Max pre-deploy backups to keep */
    maxPreDeployBackups: 5,
  },
} as const
