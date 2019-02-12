'use strict';

const { assert } = require('chai');
const Web3 = require('web3');
const sinon = require('sinon');
const EIP20CoGateway = require('../../src/ContractInteract/EIP20CoGateway');
const SpyAssert = require('../../test_utils/SpyAssert');
const AssertAsync = require('../../test_utils/AssertAsync');

describe('EIP20CoGateway.progressRedeemRawTx()', () => {
  let web3;
  let coGatewayAddress;
  let coGateway;

  let messageHash;
  let unlockSecret;
  let mockedTx;

  let spyMethod;
  let spyCall;

  const setup = () => {
    spyMethod = sinon.replace(
      coGateway.contract.methods,
      'progressRedeem',
      sinon.fake.resolves(mockedTx),
    );

    spyCall = sinon.spy(coGateway, 'progressRedeemRawTx');
  };

  const tearDown = () => {
    sinon.restore();
    spyCall.restore();
  };

  beforeEach(() => {
    web3 = new Web3();
    coGatewayAddress = '0x0000000000000000000000000000000000000002';
    coGateway = new EIP20CoGateway(web3, coGatewayAddress);

    messageHash =
      '0x0000000000000000000000000000000000000000000000000000000000000001';
    unlockSecret = '0x1111111111';
    mockedTx = 'MockedTx';
  });

  it('should throw an error when message hash is undefined', async () => {
    await AssertAsync.reject(
      coGateway.progressRedeemRawTx(undefined, unlockSecret),
      'Invalid message hash: undefined.',
    );
  });

  it('should throw an error when unlock secret is undefined', async () => {
    await AssertAsync.reject(
      coGateway.progressRedeemRawTx(messageHash, undefined),
      'Invalid unlock secret: undefined.',
    );
  });

  it('should return correct transaction object', async () => {
    setup();
    const result = await coGateway.progressRedeemRawTx(
      messageHash,
      unlockSecret,
    );
    assert.strictEqual(
      result,
      mockedTx,
      'Function should return mocked transaction object.',
    );

    SpyAssert.assert(spyMethod, 1, [[messageHash, unlockSecret]]);
    SpyAssert.assert(spyCall, 1, [[messageHash, unlockSecret]]);
    tearDown();
  });
});
