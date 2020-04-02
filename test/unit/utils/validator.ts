import should from 'should';
import * as Validator from '../../../src/utils/validate';
import { HashType } from '../../../src/coin/baseCoin/iface';

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
});
