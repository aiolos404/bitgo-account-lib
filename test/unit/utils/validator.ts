import should from 'should';
import * as Validator from '../../../src/utils/validate';
import { HashType } from '../../../src/coin/baseCoin/iface';
import { hashTypes } from '../../../src/coin/xtz/utils';

describe('Shared utils validate library should', function() {
  const hex = '7FFF1FC0037E0000000000000000000000000000000000000000000000000000';

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

  it('validate a hash', () => {
    const hash = 'spsig1DWTuXdgUg2t64PLRfaapsYejCoCVVkqy2Zjv41Zirt7MjoqSfBnP38qoAg3SWicfQNiG25yMqGYge4jrfrwv9H8hRKDyY';
    Validator.isValidHash(hash, hashTypes.spsig1).should.be.true();
  });
});
