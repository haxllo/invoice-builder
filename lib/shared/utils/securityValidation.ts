/**
 * Security validation utilities for financial data and user inputs
 * Implements defensive validation to prevent data corruption and injection attacks
 */

// Financial validation constants
export const FINANCIAL_LIMITS = {
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999.99, // ~1 billion
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 999999,
  MIN_TAX_RATE: 0,
  MAX_TAX_RATE: 100,
  DECIMAL_PLACES: 2,
} as const;

// File upload constants
export const FILE_UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'],
  ALLOWED_IMAGE_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
} as const;

// File signature validation (magic bytes)
const FILE_SIGNATURES: Record<string, string[]> = {
  'image/png': ['89504e47'],
  'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3'],
  'image/webp': ['52494646'],
  'image/gif': ['47494638'],
};

/**
 * Validates financial amounts (prices, totals, discounts)
 * Prevents negative values, NaN, Infinity, and excessive amounts
 */
export function validateFinancialAmount(value: any, fieldName: string = 'Amount'): number {
  // Convert to number
  const num = Number(value);
  
  // Check for invalid number types
  if (isNaN(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  
  if (!Number.isFinite(num)) {
    throw new Error(`${fieldName} must be a finite number`);
  }
  
  // Check range
  if (num < FINANCIAL_LIMITS.MIN_AMOUNT) {
    throw new Error(`${fieldName} cannot be negative`);
  }
  
  if (num > FINANCIAL_LIMITS.MAX_AMOUNT) {
    throw new Error(`${fieldName} exceeds maximum allowed value of ${FINANCIAL_LIMITS.MAX_AMOUNT.toLocaleString()}`);
  }
  
  // Round to 2 decimal places to prevent floating point issues
  return Math.round(num * 100) / 100;
}

/**
 * Validates quantity values
 * Must be positive integers within reasonable range
 */
export function validateQuantity(value: any, fieldName: string = 'Quantity'): number {
  const num = Number(value);
  
  if (isNaN(num) || !Number.isFinite(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  
  // Must be integer
  if (!Number.isInteger(num)) {
    throw new Error(`${fieldName} must be a whole number`);
  }
  
  if (num < FINANCIAL_LIMITS.MIN_QUANTITY) {
    throw new Error(`${fieldName} must be at least ${FINANCIAL_LIMITS.MIN_QUANTITY}`);
  }
  
  if (num > FINANCIAL_LIMITS.MAX_QUANTITY) {
    throw new Error(`${fieldName} cannot exceed ${FINANCIAL_LIMITS.MAX_QUANTITY.toLocaleString()}`);
  }
  
  return num;
}

/**
 * Validates tax rate percentages
 * Must be between 0-100%
 */
export function validateTaxRate(value: any, fieldName: string = 'Tax rate'): number {
  const num = Number(value);
  
  if (isNaN(num) || !Number.isFinite(num)) {
    throw new Error(`${fieldName} must be a valid number`);
  }
  
  if (num < FINANCIAL_LIMITS.MIN_TAX_RATE) {
    throw new Error(`${fieldName} cannot be negative`);
  }
  
  if (num > FINANCIAL_LIMITS.MAX_TAX_RATE) {
    throw new Error(`${fieldName} cannot exceed ${FINANCIAL_LIMITS.MAX_TAX_RATE}%`);
  }
  
  // Round to 2 decimal places
  return Math.round(num * 100) / 100;
}

/**
 * Validates file upload - client-side checks
 * Server-side validation should also be implemented via Supabase Storage policies
 */
export function validateFileUpload(file: File): void {
  // Check file size
  if (file.size > FILE_UPLOAD_LIMITS.MAX_SIZE) {
    const maxMB = FILE_UPLOAD_LIMITS.MAX_SIZE / (1024 * 1024);
    throw new Error(`File size exceeds maximum allowed size of ${maxMB}MB`);
  }
  
  // Check MIME type
  if (!FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    throw new Error(`Invalid file type. Allowed types: ${FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.join(', ')}`);
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!extension || !FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_EXTENSIONS.includes(extension as any)) {
    throw new Error(`Invalid file extension. Allowed: ${FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_EXTENSIONS.join(', ')}`);
  }
  
  // File name sanitization check
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    throw new Error('Invalid file name - contains illegal characters');
  }
}

/**
 * Validates file signature (magic bytes) - async validation
 * This provides additional security by checking actual file content, not just extension
 */
export async function validateFileSignature(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arr = new Uint8Array(e.target?.result as ArrayBuffer);
        const header = Array.from(arr.subarray(0, 4))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        const expectedSignatures = FILE_SIGNATURES[file.type];
        if (!expectedSignatures) {
          reject(new Error(`Unknown file type: ${file.type}`));
          return;
        }
        
        const isValid = expectedSignatures.some(sig => 
          header.toLowerCase().startsWith(sig.toLowerCase())
        );
        
        if (!isValid) {
          reject(new Error('File signature mismatch - file may be corrupted or disguised'));
          return;
        }
        
        resolve();
      } catch (error) {
        reject(new Error('Failed to validate file signature'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

/**
 * Sanitizes string inputs to prevent XSS
 * React auto-escapes JSX, but this provides additional safety for edge cases
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
}

/**
 * Validates email format
 * Basic validation - full validation should happen server-side
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321
}

/**
 * Validates phone number format (basic)
 * Allows various formats but prevents injection attempts
 */
export function validatePhone(phone: string): boolean {
  // Allow digits, spaces, hyphens, parentheses, and plus
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.length >= 7 && phone.length <= 20;
}

/**
 * Validates invoice number format
 * Prevents path traversal and injection attempts
 */
export function validateInvoiceNumber(invoiceNumber: string): boolean {
  // Allow alphanumeric, hyphens, and underscores only
  const invoiceRegex = /^[A-Za-z0-9\-_]+$/;
  return invoiceRegex.test(invoiceNumber) && invoiceNumber.length >= 1 && invoiceNumber.length <= 50;
}

/**
 * Rate limiting helper - client-side throttling
 * Server-side rate limiting should also be implemented
 */
export class RateLimiter {
  private lastCall: number = 0;
  private callCount: number = 0;
  private readonly minInterval: number;
  private readonly maxCalls: number;
  private readonly resetInterval: number;
  
  constructor(minIntervalMs: number = 1000, maxCallsPerMinute: number = 60) {
    this.minInterval = minIntervalMs;
    this.maxCalls = maxCallsPerMinute;
    this.resetInterval = 60000; // 1 minute
  }
  
  canProceed(): boolean {
    const now = Date.now();
    
    // Reset counter if minute has passed
    if (now - this.lastCall > this.resetInterval) {
      this.callCount = 0;
    }
    
    // Check rate limits
    if (now - this.lastCall < this.minInterval) {
      return false;
    }
    
    if (this.callCount >= this.maxCalls) {
      return false;
    }
    
    this.lastCall = now;
    this.callCount++;
    return true;
  }
  
  getRemainingCalls(): number {
    return Math.max(0, this.maxCalls - this.callCount);
  }
}
