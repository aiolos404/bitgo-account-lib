import * as base58check from 'bs58check';
import { HashType } from '../coin/baseCoin/iface';
import { hashTypes } from './hash';
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

/**
 * Returns whether or not the string is a valid address
 *
 * @param {string} hash - the address to validate
 * @returns {boolean}
 */
export function isValidAddress(hash: string): boolean {
  return isValidImplicitAddress(hash) || isValidHash(hash, hashTypes.KT);
}

/**
 * Returns whether or not the string is a valid implicit account address
 *
 * @param {string} hash - the address to validate
 * @returns {boolean}
 */
export function isValidImplicitAddress(hash: string): boolean {
  return isValidHash(hash, hashTypes.tz1) || isValidHash(hash, hashTypes.tz2) || isValidHash(hash, hashTypes.tz3);
}

/**
 * Returns whether or not the string is a valid originated account address
 *
 * @param {string} hash - the address to validate
 * @returns {boolean}
 */
export function isValidOriginatedAddress(hash: string): boolean {
  return isValidHash(hash, hashTypes.KT);
}

/**
 * Returns whether or not the string is a valid signature
 *
 * @param {string} hash - the signature to validate
 * @returns {boolean}
 */
export function isValidSignature(hash: string): boolean {
  return (
    isValidHash(hash, hashTypes.edsig) ||
    isValidHash(hash, hashTypes.spsig1) ||
    isValidHash(hash, hashTypes.p2sig) ||
    isValidHash(hash, hashTypes.sig)
  );
}

/**
 * Returns whether or not the string is a valid public key
 *
 * @param {string} publicKey The public key to validate
 * @returns {boolean}
 */
export function isValidPublicKey(publicKey: string): boolean {
  return (
    isValidHash(publicKey, hashTypes.sppk) ||
    isValidHash(publicKey, hashTypes.p2pk) ||
    isValidHash(publicKey, hashTypes.edpk)
  );
}

/**
 * Returns whether or not the string is a valid block hash
 *
 * @param {string} hash - the address to validate
 * @returns {boolean}
 */
export function isValidBlockHash(hash: string): boolean {
  return isValidHash(hash, hashTypes.b);
}

/**
 * Returns whether or not the string is a valid transaction hash
 *
 * @param {string} hash - the address to validate
 * @returns {boolean}
 */
export function isValidTransactionHash(hash: string): boolean {
  return isValidHash(hash, hashTypes.o);
}

/**
 * Returns whether or not the string is a valid key given a prefix
 *
 * @param {string} hash - the key to validate
 * @param {HashType} hashType - the type of the provided hash
 * @returns {boolean}
 */
export function isValidKey(hash: string, hashType: HashType): boolean {
  return isValidHash(hash, hashType);
}
