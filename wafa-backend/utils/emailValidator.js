import dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

// List of common disposable/temporary email domains
const disposableEmailDomains = [
  'tempmail.com',
  'throwaway.email',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
  'trashmail.com',
  'fakeinbox.com',
  'yopmail.com',
  'maildrop.cc',
  'getnada.com',
  'temp-mail.org',
  'tempmailaddress.com',
  'emailondeck.com',
  'mailnesia.com',
  'spam4.me',
];

/**
 * Validate email format
 */
export const isValidEmailFormat = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if email domain is disposable/temporary
 */
export const isDisposableEmail = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
};

/**
 * Verify if email domain has valid MX records (DNS check)
 * This checks if the domain can actually receive emails
 */
export const hasValidMXRecords = async (email) => {
  try {
    const domain = email.split('@')[1];
    if (!domain) return false;

    const addresses = await resolveMx(domain);
    return addresses && addresses.length > 0;
  } catch (error) {
    // If DNS lookup fails, the domain doesn't exist or can't receive emails
    console.error('MX record lookup failed:', error.message);
    return false;
  }
};

/**
 * Comprehensive email validation
 * Returns { valid: boolean, message: string }
 */
export const validateEmailAddress = async (email) => {
  // Check format
  if (!isValidEmailFormat(email)) {
    return {
      valid: false,
      message: 'Format d\'email invalide'
    };
  }

  // Check if disposable
  if (isDisposableEmail(email)) {
    return {
      valid: false,
      message: 'Les adresses email temporaires ne sont pas autorisées'
    };
  }

  // Check MX records (DNS validation)
  try {
    const hasMX = await hasValidMXRecords(email);
    if (!hasMX) {
      return {
        valid: false,
        message: 'Ce domaine email n\'existe pas ou ne peut pas recevoir d\'emails'
      };
    }
  } catch (error) {
    // If MX check fails, allow registration but log it
    console.warn('MX record validation skipped:', error.message);
  }

  return {
    valid: true,
    message: 'Email valide'
  };
};

/**
 * Quick validation (without DNS check) for faster response
 */
export const quickValidateEmail = (email) => {
  if (!isValidEmailFormat(email)) {
    return {
      valid: false,
      message: 'Format d\'email invalide'
    };
  }

  if (isDisposableEmail(email)) {
    return {
      valid: false,
      message: 'Les adresses email temporaires ne sont pas autorisées'
    };
  }

  return {
    valid: true,
    message: 'Email valide'
  };
};
