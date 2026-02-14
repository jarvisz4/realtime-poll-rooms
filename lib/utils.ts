import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CryptoJS from 'crypto-js';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Hash an IP address using SHA-256 for privacy
 * This is used for anti-abuse mechanism - storing hashed IPs
 */
export function hashIpAddress(ip: string): string {
  // Add a salt to prevent rainbow table attacks
  const salt = process.env.IP_HASH_SALT || 'poll-rooms-default-salt';
  return CryptoJS.SHA256(ip + salt).toString();
}

/**
 * Generate a unique poll ID
 */
export function generatePollId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique option ID
 */
export function generateOptionId(): string {
  return `opt-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format a number with commas for better readability
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculate percentage with proper rounding
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Validate poll question
 * - Must be non-empty
 * - Must be at least 5 characters
 * - Must not exceed 500 characters
 */
export function validateQuestion(question: string): { valid: boolean; error?: string } {
  const trimmed = question.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Question is required' };
  }
  
  if (trimmed.length < 5) {
    return { valid: false, error: 'Question must be at least 5 characters long' };
  }
  
  if (trimmed.length > 500) {
    return { valid: false, error: 'Question must not exceed 500 characters' };
  }
  
  return { valid: true };
}

/**
 * Validate poll options
 * - Must have at least 2 non-empty options
 * - Each option must not exceed 200 characters
 * - Maximum 10 options allowed
 */
export function validateOptions(options: string[]): { valid: boolean; error?: string } {
  // Filter out empty options
  const validOptions = options.filter(opt => opt.trim().length > 0);
  
  if (validOptions.length < 2) {
    return { valid: false, error: 'At least 2 options are required' };
  }
  
  if (validOptions.length > 10) {
    return { valid: false, error: 'Maximum 10 options allowed' };
  }
  
  // Check each option length
  for (const option of validOptions) {
    if (option.trim().length > 200) {
      return { valid: false, error: 'Each option must not exceed 200 characters' };
    }
  }
  
  return { valid: true };
}

/**
 * Sanitize a string to prevent XSS
 * Basic sanitization - removes HTML tags
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Get client IP address from request headers
 * Handles various proxy configurations
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  
  // Check for forwarded headers (common in proxies/CDNs)
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // Get the first IP in the chain (client's original IP)
    return forwarded.split(',')[0].trim();
  }
  
  // Check other common headers
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback to a default (for development)
  return '127.0.0.1';
}

/**
 * Check if a poll ID is valid format
 */
export function isValidPollId(id: string): boolean {
  // Poll IDs are in format: timestamp-randomstring
  const pattern = /^[a-z0-9]+-[a-z0-9]{9}$/;
  return pattern.test(id);
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
