import * as base58check from 'bs58check';
import sodium from 'libsodium-wrappers';
import { InMemorySigner } from '@taquito/signer';
import { ec as EC } from 'elliptic';
import { SigningError } from '../baseCoin/errors';
import * as Validator from '../../utils/validate';
import { HashType, hashTypes } from '../../utils/hash';
import { genericMultisigDataToSign } from './multisigUtils';
import { SignResponse } from './iface';
import { KeyPair } from './keyPair';
import * as Utils from './utils';
// By default, use the transactions prefix
export const DEFAULT_WATERMARK = new Uint8Array([3]);

/**
 * Encode the payload to base58 with a specific Tezos prefix.
 *
 * @param {Buffer} prefix to add to the encoded payload
 * @param {Buffer} payload to encode
 * @returns {any} base58 payload with a Tezos prefix
 */
export function base58encode(prefix: Buffer, payload: Buffer): string {
  const n = Buffer.alloc(prefix.length + payload.length);
  n.set(prefix);
  n.set(payload, prefix.length);

  return base58check.encode(n);
}

/**
 * Calculate the transaction id for a for a signed transaction.
 *
 * @param {string} encodedTransaction Signed transaction in hexadecimal
 * @returns {Promise<string>} The transaction id
 */
export async function calculateTransactionId(encodedTransaction: string): Promise<string> {
  await sodium.ready;
  const encodedTransactionBuffer = Uint8Array.from(Buffer.from(encodedTransaction, 'hex'));
  const operationHashPayload = sodium.crypto_generichash(32, encodedTransactionBuffer);
  return base58encode(hashTypes.o.prefix, Buffer.from(operationHashPayload));
}

/**
 * Calculate the address of a new originated account.
 *
 * @param {string} transactionId The transaction id
 * @param {number} index The index of the origination operation inside the transaction (starts at 0)
 * @returns {Promise<string>} An originated address with the KT prefix
 */
export async function calculateOriginatedAddress(transactionId: string, index: number): Promise<string> {
  // From https://github.com/TezTech/eztz/blob/cfdc4fcfc891f4f4f077c3056f414476dde3610b/src/main.js#L768
  const ob = base58check.decode(transactionId).slice(hashTypes.o.prefix.length);

  let tt: number[] = [];
  for (let i = 0; i < ob.length; i++) {
    tt.push(ob[i]);
  }

  tt = tt.concat([
    (index & 0xff000000) >> 24,
    (index & 0x00ff0000) >> 16,
    (index & 0x0000ff00) >> 8,
    index & 0x000000ff,
  ]);

  await sodium.ready;
  const payload = sodium.crypto_generichash(20, new Uint8Array(tt));
  return base58encode(hashTypes.KT.prefix, Buffer.from(payload));
}

/**
 * Generic data signing using Tezos library.
 *
 * @param {KeyPair} keyPair A Key Pair with a private key set
 * @param {string} data The data in hexadecimal to sign
 * @param {Uint8Array} watermark Magic byte: 1 for block, 2 for endorsement, 3 for generic
 * @returns {Promise<SignResponse>}
 */
export async function sign(
  keyPair: KeyPair,
  data: string,
  watermark: Uint8Array = DEFAULT_WATERMARK,
): Promise<SignResponse> {
  if (!keyPair.getKeys().prv) {
    throw new SigningError('Missing private key');
  }
  const signer = new InMemorySigner(keyPair.getKeys().prv!);
  return signer.sign(data, watermark);
}

/**
 * Verifies the signature produced for a given message belongs to a secp256k1 public key.
 *
 * @param {string} message Message in hex format to verify
 * @param {string} publicKey secp256k1 public key with "sppk" prefix to verify the signature with
 * @param {string} signature Tezos signature with "sig" prefix
 * @param {Uint8Array} watermark Optional watermark used to generate the signature
 * @returns {Promise<boolean>}
 */
export async function verifySignature(
  message: string,
  publicKey: string,
  signature: string,
  watermark: Uint8Array = DEFAULT_WATERMARK,
): Promise<boolean> {
  const rawPublicKey = Utils.decodeKey(publicKey, hashTypes.sppk);
  const ec = new EC('secp256k1');
  const key = ec.keyFromPublic(rawPublicKey);

  const messageBuffer = Uint8Array.from(Buffer.from(message, 'hex'));
  // Tezos signatures always have a watermark
  const messageWithWatermark = new Uint8Array(watermark.length + messageBuffer.length);
  messageWithWatermark.set(watermark);
  messageWithWatermark.set(messageBuffer, watermark.length);

  await sodium.ready;
  const bytesHash = new Buffer(sodium.crypto_generichash(32, messageWithWatermark));

  const rawSignature = Utils.decodeSignature(signature, hashTypes.sig);
  return key.verify(bytesHash, { r: rawSignature.slice(0, 32), s: rawSignature.slice(32, 64) });
}

/**
 * Useful wrapper to create the generic multisig contract data to sign when moving funds.
 *
 * @param {string} contractAddress The wallet contract address with the funds to withdraw
 * @param {string} destinationAddress The address to transfer the funds to
 * @param {number} amount Number mutez to transfer
 * @param {string} contractCounter Wallet counter to use in the transaction
 * @returns {any} A JSON representation of the Michelson script to sign and approve a transfer
 */
export function generateDataToSign(
  contractAddress: string,
  destinationAddress: string,
  amount: string,
  contractCounter: string,
): any {
  if (!Validator.isValidOriginatedAddress(contractAddress)) {
    throw new Error('Invalid contract address ' + contractAddress + '. An originated account address was expected');
  }
  if (!Validator.isValidAddress(destinationAddress)) {
    throw new Error('Invalid destination address ' + destinationAddress);
  }
  return genericMultisigDataToSign(contractAddress, destinationAddress, amount, contractCounter);
}

/**
 * Get the original key form the text without the given prefix.
 *
 * @param {string} hash - base58 encoded key with a Tezos prefix
 * @param {HashType} hashType - the type of the provided hash
 * @returns {Buffer} the original decoded key
 */
export function decodeKey(hash: string, hashType: HashType): Buffer {
  if (!Validator.isValidKey(hash, hashType)) {
    throw new Error('Unsupported private key');
  }
  const decodedPrv = base58check.decode(hash);
  return Buffer.from(decodedPrv.slice(hashType.prefix.length, decodedPrv.length));
}

/**
 * Get the raw signature from a Tezos encoded one.
 *
 * @param {string} signature Tezos signatures prefixed with sig, edsig, p2sig or spsig
 * @param {HashType} hashType The prefix of remove
 * @returns {Buffer} The decoded signature without prefix
 */
export function decodeSignature(signature: string, hashType: HashType): Buffer {
  if (!Validator.isValidSignature(signature)) {
    throw new Error('Unsupported signature');
  }
  const decodedPrv = base58check.decode(signature);
  return Buffer.from(decodedPrv.slice(hashType.prefix.length, decodedPrv.length));
}

// From https://github.com/ecadlabs/taquito/blob/master/packages/taquito/src/constants.ts

export enum DEFAULT_GAS_LIMIT {
  DELEGATION = 10600,
  ORIGINATION = 10600,
  TRANSFER = 10600,
  REVEAL = 10600,
}

export enum DEFAULT_FEE {
  DELEGATION = 1257,
  ORIGINATION = 10000,
  TRANSFER = 10000,
  REVEAL = 1420,
}

export enum DEFAULT_STORAGE_LIMIT {
  DELEGATION = 0,
  ORIGINATION = 257,
  TRANSFER = 257,
  REVEAL = 0,
}
