'use strict';

const { assert } = require('chai');
const Web3 = require('web3');
const sinon = require('sinon');
const EIP20Gateway = require('../../src/ContractInteract/EIP20Gateway');
const EIP20Token = require('../../src/ContractInteract/EIP20Token');
const SpyAssert = require('../../test_utils/SpyAssert');
const AssertAsync = require('../../test_utils/AssertAsync');

describe('EIP20Gateway.isBountyAmountApproved()', () => {
  let web3;
  let gatewayAddress;
  let gateway;

  let facilitatorAddress;
  let baseTokenAddress;
  let mockedResult;
  let mockedBountyAmount;

  let mockedValueToken;
  let spyGetBounty;
  let spyGetBaseTokenContract;
  let spyIsAmountApproved;
  let spyCall;

  const setup = () => {
    const token = new EIP20Token(web3, baseTokenAddress);
    mockedValueToken = sinon.mock(token);
    spyGetBaseTokenContract = sinon.replace(
      gateway,
      'getBaseTokenContract',
      sinon.fake.resolves(mockedValueToken.object),
    );
    spyIsAmountApproved = sinon.replace(
      mockedValueToken.object,
      'isAmountApproved',
      sinon.fake.returns(mockedResult),
    );
    spyGetBounty = sinon.replace(
      gateway,
      'getBounty',
      sinon.fake.resolves(mockedBountyAmount),
    );
    spyCall = sinon.spy(gateway, 'isBountyAmountApproved');
  };

  const tearDown = () => {
    sinon.restore();
    spyCall.restore();
    mockedValueToken.restore();
  };

  beforeEach(() => {
    web3 = new Web3();
    gatewayAddress = '0x0000000000000000000000000000000000000002';
    gateway = new EIP20Gateway(web3, gatewayAddress);

    facilitatorAddress = '0x0000000000000000000000000000000000000005';
    baseTokenAddress = '0x0000000000000000000000000000000000000004';
    mockedResult = true;
    mockedBountyAmount = '1000';
  });

  it('should throw an error when facilitator address is undefined', async () => {
    await AssertAsync.reject(
      gateway.isBountyAmountApproved(undefined),
      'Invalid facilitator address: undefined.',
    );
  });

  it('should pass with correct params', async () => {
    setup();
    const result = await gateway.isBountyAmountApproved(facilitatorAddress);
    assert.strictEqual(
      result,
      true,
      'Result of isBountyAmountApproved must be true.',
    );

    SpyAssert.assert(spyGetBounty, 1, [[]]);
    SpyAssert.assert(spyGetBaseTokenContract, 1, [[]]);
    SpyAssert.assert(spyIsAmountApproved, 1, [
      [facilitatorAddress, gatewayAddress, mockedBountyAmount],
    ]);
    SpyAssert.assert(spyCall, 1, [[facilitatorAddress]]);
    tearDown();
  });
});
