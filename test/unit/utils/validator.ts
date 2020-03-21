import should from 'should';
import * as Validator from '../../../src/utils/validate';
import { HashType, hashTypes } from '../../../src/utils/hash';

describe('Shared utils validate library should', function() {
  // arbitrary text
  const arr = [127, 255, 31, 192, 3, 126, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const hex = '7FFF1FC0037E0000000000000000000000000000000000000000000000000000';
  const txt = 'arbitrary string to sign';
  const signedString =
    '0x9424113f32c17b6ffbeee024e1a54b6991d756e82f66cca16a41231fdfa270d03b08e833f5dbbd5cc86896c2e5ea6c74d2e292cda21f717164f994fcdf28486d1b';

  it('validate a hex string', () => {
    const hex = ['0xaffd', '0x11'];
    hex.map(hex => {
      should(Validator.isValidHex(hex)).ok();
    });

    const invalidHex = ['0xa11', '0xFFdYYY', '0x', ''];
    invalidHex.map(hex => {
      should(Validator.isValidHex(hex)).equal(false);
    });
  });

  describe('address', function() {
    it('should validate addresses', function() {
      const validAddresses = [
        'tz1aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9',
        'tz2SHdGxFGhs68wYNC4hEqxbWARxp2J4mVxv',
        'tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB',
        'KT1EGbAxguaWQFkV3Egb2Z1r933MWuEYyrJS',
      ];

      for (const address of validAddresses) {
        Validator.isValidAddress(address).should.be.true();
      }
    });

    it('should fail to validate invalid addresses', function() {
      const invalidAddresses = [
        'tz4aWXP237BLwNHJcCD4b3DutCevhqq2T1Z9',
        'xtz2SHdGxFGhs68wYNC4hEqxbWARxp2J4mVxv',
        'KT2EGbAxguaWQFkV3Egb2Z1r933MWuEYyrJS',
        'abc',
      ];

      for (const address of invalidAddresses) {
        should.doesNotThrow(() => Validator.isValidAddress(address));
        Validator.isValidAddress(address).should.be.false();
      }
    });
  });

  describe('block hash', function() {
    it('should validate block hashes', function() {
      const validHashes = [
        'BKoifs5gGffAzuRBcg3ygxbLdrCXyDDS1ALvMG8SFYWahzoYMku',
        'BL4oxWAkozJ3mJHwVFQqga5dQMBi8kBCPAQyBKgF78z7SQT1AvN',
        'BL29n92KHaarq1r7XjwTFotzCpxq7LtXMc9bF2qD9Qt26ZTYQia',
      ];

      for (const hash of validHashes) {
        Validator.isValidBlockHash(hash).should.be.true();
      }
    });

    it('should fail to validate invalid block hashes', function() {
      const invalidHashes = [
        'AKoifs5gGffAzuRBcg3ygxbLdrCXyDDS1ALvMG8SFYWahzoYMku',
        'BKoifs5gGffAzuRBcg3ygxbLdrCXyDDS1ALvMG8SFYWahzoYMku1111111111',
        'invalid',
      ];

      for (const hash of invalidHashes) {
        Validator.isValidBlockHash(hash).should.be.false();
      }
    });
  });

  describe('transaction hash', function() {
    it('should validate tx hashes', function() {
      const validHashes = [
        'opUmZNMueryYFxTbzzocS7K4dzs3NmgKqhhr9TkcftszDDnoRVu',
        'ookyzxsYF7vyTeDzsgs58XJ4PXuvBkK8wWqZJ4EoRS6RWQb4Y9P',
        'ooXQoUX32szALRvgzD2TDzeRPXtPfmfqwoehPaK5khbrBiMAtSw',
      ];

      for (const hash of validHashes) {
        Validator.isValidTransactionHash(hash).should.be.true();
      }
    });

    it('should fail to validate invalid tx hashes', function() {
      const invalidHashes = [
        'lpUmZNMueryYFxTbzzocS7K4dzs3NmgKqhhr9TkcftszDDnoRVu',
        'opUmZNMueryYFxTbzzocS7K4dzs3NmgKqhhr9TkcftszDDnoRVu1111111111',
        'invalid',
      ];

      for (const hash of invalidHashes) {
        Validator.isValidTransactionHash(hash).should.be.false();
      }
    });
  });

  describe('signature', function() {
    it('should validate signature', function() {
      const validSignatures = [
        'sigVgnaU2S1L4jhtPaTX2SAxsGpP1dRS89VTSR9FrFuxxPvgA2G67QRuez6o6xP7ekagdZX4ELvh7pbMMdLoBSzvk2AVyQpk',
        'spsig1DWTuXdgUg2t64PLRfaapsYejCoCVVkqy2Zjv41Zirt7MjoqSfBnP38qoAg3SWicfQNiG25yMqGYge4jrfrwv9H8hRKDyY',
        'sigS9pqYUXiUJcz2Wsx5x98ud9KtgGVg4gCwpBoDBgHrZy9gwJedKMCrcQPxm9C7i1gesETbhFD6Gm8BpadGgd2cgiGoQbiY',
        'spsig19yWAc5nBpGmNCWdvEWHnpJXEiTqZjhNgWwWa1Lz6kVgakb7qCPj9z6G6LLEFWmsmNcPCZYseERVDUXh99N7wqDppcDKQM',
      ];

      for (const hash of validSignatures) {
        Validator.isValidSignature(hash).should.be.true();
      }
    });

    it('should fail to validate invalid signature', function() {
      const invalidHashes = [
        'sigS9pqYUXiUJcz2Wsx5x98ud9KtgGVg4gCwpBoDBgHrZ',
        'sig',
        'BKoifs5gGffAzuRBcg3ygxbLdrCXyDDS1ALvMG8SFYWahzoYMku1111111111',
        'invalid',
      ];

      for (const hash of invalidHashes) {
        Validator.isValidSignature(hash).should.be.false();
      }
    });
  });
});
