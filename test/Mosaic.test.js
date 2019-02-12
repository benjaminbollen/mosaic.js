'use strict';

const { assert } = require('chai');
const Web3 = require('web3');

const Chain = require('../src/Chain');
const Mosaic = require('../src/Mosaic');

describe('Mosaic', () => {
  // This is not used to actually make calls, only to assert correct parameters.
  const web3ProviderOrigin = 'http://localhost:8545';
  const web3Origin = new Web3(web3ProviderOrigin);
  const web3ProviderAuxiliary = 'http://localhost:8546';
  const web3Auxiliary = new Web3(web3ProviderAuxiliary);

  const contractAddressesOrigin = {
    Anchor: 'anchor',
    Token: 'token',
  };
  const contractAddressesAuxiliary = {
    Anchor: 'anchorAux',
    EIP20CoGateway: 'cogateway',
  };

  const origin = new Chain(web3Origin, contractAddressesOrigin);
  const auxiliary = new Chain(web3Auxiliary, contractAddressesAuxiliary);

  it('sets the correct parameters', () => {
    const mosaic = new Mosaic(origin, auxiliary);

    assert.deepEqual(
      origin,
      mosaic.origin,
      'Mosaic did not set the correct origin chain parameter on construction.',
    );
    assert.deepEqual(
      auxiliary,
      mosaic.auxiliary,
      'Mosaic did not set the correct auxiliary chain parameter on construction.',
    );
  });

  it('makes the parameters read-only', () => {
    const mosaic = new Mosaic(origin, auxiliary);

    assert.throws(() => {
      mosaic.origin = new Chain(web3Origin, contractAddressesOrigin);
    }, /Cannot assign to read only property/);
    assert.throws(() => {
      mosaic.auxiliary = new Chain(web3Auxiliary, contractAddressesAuxiliary);
    }, /Cannot assign to read only property/);
  });

  it('checks for the correct argument types', () => {
    assert.throws(
      () => new Mosaic({}, auxiliary),
      'origin must be an instance of Chain.',
    );
    assert.throws(
      () => new Mosaic(origin, {}),
      'auxiliary must be an instance of Chain.',
    );
  });
});
