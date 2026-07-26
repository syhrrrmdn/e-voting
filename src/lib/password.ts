import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt (secure, salted, key-stretched).
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, BCRYPT_SALT_ROUNDS);
}

/**
 * Verify a password against a stored hash.
 * Supports gradual migration from legacy SHA-256 to bcrypt:
 *   1. Try bcrypt first (new format).
 *   2. If bcrypt fails, try legacy SHA-256 comparison.
 *   3. If SHA-256 matches, return { valid: true, needsRehash: true }.
 */
export async function verifyPassword(
  plaintext: string,
  storedHash: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  // 1. Try bcrypt verification (hashes start with "$2a$" or "$2b$")
  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    const valid = await bcrypt.compare(plaintext, storedHash);
    return { valid, needsRehash: false };
  }

  // 2. Legacy SHA-256 fallback (64-char hex string)
  if (storedHash.length === 64 && /^[a-f0-9]+$/.test(storedHash)) {
    const sha256Hash = crypto.createHash('sha256').update(plaintext).digest('hex');
    const valid = sha256Hash === storedHash;
    return { valid, needsRehash: valid }; // If valid, needs rehash to bcrypt
  }

  // 3. Unknown format
  return { valid: false, needsRehash: false };
}
