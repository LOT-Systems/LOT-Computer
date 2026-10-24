/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Security Utilities for LOT Systems
 *
 * Provides audit logging, suspicious activity detection, session security,
 * and input sanitization utilities.
 */

import crypto from 'crypto'
import { FastifyRequest } from 'fastify'
import config from '#server/config'

// =============================================================================
// AUDIT LOGGING
// =============================================================================

export enum AuditEvent {
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILED = 'auth.login.failed',
  LOGIN_BLOCKED = 'auth.login.blocked',
  LOGOUT = 'auth.logout',
  SESSION_EXPIRED = 'auth.session.expired',
  SESSION_INVALID = 'auth.session.invalid',
  ADMIN_ACCESS = 'admin.access',
  ADMIN_ACTION = 'admin.action',
  RATE_LIMITED = 'security.rate_limited',
  SUSPICIOUS_ACTIVITY = 'security.suspicious',
  DATA_EXPORT = 'data.export',
  SETTINGS_CHANGED = 'user.settings_changed',
  TAG_CHANGED = 'admin.tag_changed',
}

interface AuditLogEntry {
  timestamp: string
  event: AuditEvent
  ip: string
  userAgent: string
  userId?: string
  email?: string
  details?: Record<string, unknown>
  requestId?: string
}

/**
 * Write a structured audit log entry.
 * In production, these should be piped to a log aggregation service.
 */
export function auditLog(entry: AuditLogEntry): void {
  const logLine = JSON.stringify({
    ...entry,
    _type: 'audit',
  })

  // Use stderr for audit logs so they can be captured separately
  if (config.env === 'production') {
    process.stderr.write(logLine + '\n')
  } else {
    console.log('[audit]', logLine)
  }
}

/**
 * Create an audit log entry from a Fastify request
 */
export function auditFromRequest(
  req: FastifyRequest,
  event: AuditEvent,
  details?: Record<string, unknown>
): void {
  auditLog({
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip,
    userAgent: sanitizeHeader(req.headers['user-agent'] || 'unknown'),
    userId: (req as any).user?.id,
    email: (req as any).user?.email,
    details,
    requestId: req.id as string,
  })
}

// =============================================================================
// SUSPICIOUS ACTIVITY DETECTION
// =============================================================================

interface SuspiciousActivityTracker {
  /** Rapid-fire requests from same IP (potential automated attack) */
  rapidRequests: Map<string, { count: number; windowStart: number }>
  /** Multiple failed auth attempts across different emails (credential stuffing) */
  multiEmailAttempts: Map<string, Set<string>>
  /** Unusual request patterns (e.g., scanning for common vulnerability paths) */
  scanPatterns: Map<string, number>
}

const tracker: SuspiciousActivityTracker = {
  rapidRequests: new Map(),
  multiEmailAttempts: new Map(),
  scanPatterns: new Map(),
}

// Clean up trackers every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000
  for (const [key, value] of tracker.rapidRequests) {
    if (value.windowStart < cutoff) tracker.rapidRequests.delete(key)
  }
  // Clear multi-email tracking (no per-entry timestamps, so reset the whole map)
  tracker.multiEmailAttempts.clear()
  tracker.scanPatterns.clear()
}, 10 * 60 * 1000)

/** Known vulnerability scan paths that indicate automated scanning */
const SCAN_PATTERNS = [
  '/wp-admin',
  '/wp-login',
  '/.env',
  '/phpinfo',
  '/phpmyadmin',
  '/admin/login',
  '/actuator',
  '/.git/config',
  '/xmlrpc.php',
  '/wp-content',
  '/vendor/',
  '/.well-known/security.txt',
  '/api/v1',
  '/graphql',
  '/debug',
  '/trace',
  '/console',
]

/**
 * Check if a request looks like an automated vulnerability scan
 */
export function isVulnerabilityScan(url: string): boolean {
  const normalized = url.toLowerCase().split('?')[0]
  return SCAN_PATTERNS.some((pattern) => normalized.startsWith(pattern))
}

/**
 * Track failed login attempts across different emails from same IP.
 * Returns true if the pattern looks like credential stuffing.
 */
export function trackMultiEmailAttempt(ip: string, email: string): boolean {
  let emails = tracker.multiEmailAttempts.get(ip)
  if (!emails) {
    emails = new Set()
    tracker.multiEmailAttempts.set(ip, emails)
  }
  emails.add(email)
  // If same IP tries 5+ different emails, flag as suspicious
  return emails.size >= 5
}

/**
 * Track rapid request rate from an IP.
 * Returns true if the rate is suspicious (>30 requests in 10 seconds).
 */
export function trackRapidRequests(ip: string): boolean {
  const now = Date.now()
  const window = tracker.rapidRequests.get(ip)

  if (!window || now - window.windowStart > 10_000) {
    tracker.rapidRequests.set(ip, { count: 1, windowStart: now })
    return false
  }

  window.count++
  return window.count > 30
}

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitize a header value to prevent log injection attacks.
 * Removes newlines and control characters.
 */
export function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n\x00-\x1f]/g, '').slice(0, 500)
}

/**
 * Sanitize user-provided text to prevent stored XSS.
 * Escapes HTML special characters.
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
  return crypto.randomBytes(16).toString('base64')
}

// =============================================================================
// SESSION SECURITY
// =============================================================================

/** Maximum session age in milliseconds (30 days) */
export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

/** Absolute maximum session age - force re-auth after 90 days regardless */
export const SESSION_ABSOLUTE_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000

/**
 * Check if a session has expired based on its creation date
 */
export function isSessionExpired(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() > SESSION_MAX_AGE_MS
}

/**
 * Check if a session has exceeded its absolute lifetime
 */
export function isSessionAbsoluteExpired(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() > SESSION_ABSOLUTE_MAX_AGE_MS
}

/**
 * Hash a session token for secure storage comparison.
 * This prevents session token theft from database dumps.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// =============================================================================
// ANTI-THEFT: REQUEST FINGERPRINTING
// =============================================================================

/**
 * Generate a lightweight fingerprint from request metadata.
 * Used to detect session hijacking (same token, different fingerprint).
 * NOT used as a sole auth factor - only as an additional signal.
 */
export function generateRequestFingerprint(req: FastifyRequest): string {
  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
  ]
  return crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex')
    .slice(0, 16)
}

// =============================================================================
// SECURITY RESPONSE HEADERS
// =============================================================================

/**
 * Additional security headers beyond what Helmet provides
 */
export const ADDITIONAL_SECURITY_HEADERS = {
  // Permissions Policy - restrict browser features
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(self), payment=(), usb=()',
  // Cross-Origin policies
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
} as const
