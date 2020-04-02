import * as base58check from 'bs58check';
import { HashType } from '../coin/baseCoin/iface';
/**
 * Indicates whether the passed string is a safe hex string for tron's purposes.
 *
 * @param hex A valid hex string must be a string made of numbers and characters and has an even length.
 */
export function isValidHex(hex: string): boolean {
  return /^(0x)?([0-9a-f]{2})+$/i.test(hex);
}

/**
 * Returns whether or not the string is a valid hash of the given type
 *
 * @param {string} hash - the string to validate
 * @param {HashType} hashType - the type of the provided hash
 * @returns {boolean}
 */
export function isValidHash(hash: string, hashType: HashType): boolean {
  // Validate encoding
  let decodedHash;
  try {
    decodedHash = base58check.decode(hash);
  } catch (e) {
    return false;
  }
  const hashPrefix = decodedHash.slice(0, hashType.prefix.length);

  // Check prefix
  if (!hashPrefix.equals(Buffer.from(hashType.prefix))) {
    return false;
  }

  // Check length
  const hashLength = decodedHash.length - hashPrefix.length;
  return hashLength === hashType.byteLength;
}
