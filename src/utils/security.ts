const SYSTEM_SALT = "mis_secure_storage_salt_2026";

/**
 * Encrypts any data payload using URL encoding, XOR cipher, and Base64.
 * Safely handles Unicode characters and returns an obfuscated string.
 */
export function encryptData(data: any): string {
  if (data === undefined || data === null) return '';
  try {
    const jsonStr = JSON.stringify(data);
    const asciiStr = encodeURIComponent(jsonStr);
    let cipher = '';
    for (let i = 0; i < asciiStr.length; i++) {
      cipher += String.fromCharCode(asciiStr.charCodeAt(i) ^ SYSTEM_SALT.charCodeAt(i % SYSTEM_SALT.length));
    }
    return btoa(cipher);
  } catch (e) {
    console.error("Encryption failed:", e);
    return '';
  }
}

/**
 * Decrypts a Base64 cipher back into its original data structure.
 * Automatically detects and returns plaintext if the input is not encrypted (for backward compatibility).
 */
export function decryptData(ciphertext: string): any {
  if (!ciphertext) return null;
  
  // Backward compatibility check: if it's valid JSON but not encrypted, return it directly
  if (ciphertext.trim().startsWith('{') || ciphertext.trim().startsWith('[')) {
    try {
      return JSON.parse(ciphertext);
    } catch {
      // Not JSON, continue to decrypt
    }
  }

  try {
    const cipher = atob(ciphertext);
    let asciiStr = '';
    for (let i = 0; i < cipher.length; i++) {
      asciiStr += String.fromCharCode(cipher.charCodeAt(i) ^ SYSTEM_SALT.charCodeAt(i % SYSTEM_SALT.length));
    }
    const jsonStr = decodeURIComponent(asciiStr);
    return JSON.parse(jsonStr);
  } catch (e) {
    // If decryption fails, it could be plaintext that is not JSON.
    // Try to return the ciphertext itself as a fallback if it's a simple string.
    try {
      return JSON.parse(ciphertext);
    } catch {
      return null;
    }
  }
}

/**
 * Generates an HMAC-like hex checksum to verify backup integrity.
 */
export function generateBackupSignature(dataPayload: string): string {
  let hash = 0;
  const mix = dataPayload + SYSTEM_SALT;
  for (let i = 0; i < mix.length; i++) {
    hash = mix.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}
