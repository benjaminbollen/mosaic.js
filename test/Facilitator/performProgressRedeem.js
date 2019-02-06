// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------
//
// http://www.simpletoken.org/
//
// ----------------------------------------------------------------------------

const chai = require('chai');
const sinon = require('sinon');
const Facilitator = require('../../src/Facilitator/Facilitator');
const TestMosaic = require('../../test_utils/GetTestMosaic');
const AssertAsync = require('../../test_utils/AssertAsync');
const SpyAssert = require('../../test_utils/SpyAssert');
const Message = require('../../src/utils/Message');

const MessageStatus = Message.messageStatus();
const assert = chai.assert;

describe('Facilitator.performProgressRedeem()', () => {
  let mosaic;
  let facilitator;
  let progressRedeemParams;

  let getOutboxMessageStatusResult;
  let progressRedeemResult;

  let spyGetOutboxMessageStatus;
  let spyProgressRedeem;
  let spyCall;

  const setup = () => {
    spyCall = sinon.spy(facilitator, 'performProgressRedeem');
    spyGetOutboxMessageStatus = sinon.replace(
      facilitator.coGateway,
      'getOutboxMessageStatus',
      sinon.fake.resolves(getOutboxMessageStatusResult),
    );
    spyProgressRedeem = sinon.replace(
      facilitator.coGateway,
      'progressRedeem',
      sinon.fake.resolves(progressRedeemResult),
    );
  };
  const teardown = () => {
    sinon.restore();
    spyCall.restore();
  };

  beforeEach(() => {
    mosaic = TestMosaic.mosaic();
    facilitator = new Facilitator(mosaic);
    progressRedeemParams = {
      messageHash:
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      unlockSecret:
        '0x0000000000000000000000000000000000000000000000000000000000000002',
      txOptions: {
        from: '0x0000000000000000000000000000000000000001',
        gas: '7500000',
      },
    };
    getOutboxMessageStatusResult = MessageStatus.DECLARED;
    progressRedeemResult = true;
  });

  it('should throw an error when message hash is undefined', async () => {
    delete progressRedeemParams.messageHash;
    await AssertAsync.reject(
      facilitator.performProgressRedeem(
        progressRedeemParams.messageHash,
        progressRedeemParams.unlockSecret,
        progressRedeemParams.txOptions,
      ),
      `Invalid message hash: ${progressRedeemParams.messageHash}.`,
    );
  });

  it('should throw an error when unlock secret is undefined', async () => {
    delete progressRedeemParams.unlockSecret;
    await AssertAsync.reject(
      facilitator.performProgressRedeem(
        progressRedeemParams.messageHash,
        progressRedeemParams.unlockSecret,
        progressRedeemParams.txOptions,
      ),
      `Invalid unlock secret: ${progressRedeemParams.unlockSecret}.`,
    );
  });

  it('should throw an error when transaction options is undefined', async () => {
    delete progressRedeemParams.txOptions;
    await AssertAsync.reject(
      facilitator.performProgressRedeem(
        progressRedeemParams.messageHash,
        progressRedeemParams.unlockSecret,
        progressRedeemParams.txOptions,
      ),
      `Invalid transaction option: ${progressRedeemParams.txOptions}.`,
    );
  });

  it('should throw an error when outbox message status is undeclared', async () => {
    getOutboxMessageStatusResult = MessageStatus.UNDECLARED;
    setup();
    await AssertAsync.reject(
      facilitator.performProgressRedeem(
        progressRedeemParams.messageHash,
        progressRedeemParams.unlockSecret,
        progressRedeemParams.txOptions,
      ),
      'Message cannot be progressed.',
    );

    SpyAssert.assert(spyGetOutboxMessageStatus, 1, [
      [progressRedeemParams.messageHash],
    ]);
    SpyAssert.assert(spyProgressRedeem, 0, [[]]);
    SpyAssert.assert(spyCall, 1, [
      [
        progressRedeemParams.messageHash,
        progressRedeemParams.unlockSecret,
        progressRedeemParams.txOptions,
      ],
    ]);

    teardown();
  });

  it('should throw an error when outbox message status is revocation declared', async () => {
    getOutboxMessageStatusResult = MessageStatus.REVOCATION_DECLARED;
    setup();
    await AssertAsync.reject(
      facilitator.performProgressRedeem(
        progressRedeemParams.messageHash,
        progressRedeemParams.unlockSecret,
        progressRedeemParams.txOptions,
      ),
      'Message cannot be progressed.',
    );

    SpyAssert.assert(spyGetOutboxMessageStatus, 1, [
      [progressRedeemParams.messageHash],
    ]);
    SpyAssert.assert(spyProgressRedeem, 0, [[]]);
    SpyAssert.assert(spyCall, 1, [
      [
        progressRedeemParams.messageHash,
        progressRedeemParams.unlockSecret,
        progressRedeemParams.txOptions,
      ],
    ]);

    teardown();
  });

  it('should throw an error when outbox message status is revoked', async () => {
    getOutboxMessageStatusResult = MessageStatus.REVOKED;
    setup();
    await AssertAsync.reject(
      facilitator.performProgressRedeem(
        progressRedeemParams.messageHash,
        progressRedeemParams.unlockSecret,
        progressRedeemParams.txOptions,
      ),
      'Message cannot be progressed.',
    );

    SpyAssert.assert(spyGetOutboxMessageStatus, 1, [
      [progressRedeemParams.messageHash],
    ]);
    SpyAssert.assert(spyProgressRedeem, 0, [[]]);
    SpyAssert.assert(spyCall, 1, [
      [
        progressRedeemParams.messageHash,
        progressRedeemParams.unlockSecret,
        progressRedeemParams.txOptions,
      ],
    ]);

    teardown();
  });

  it('should pass with correct parameters', async () => {
    setup();
    const result = await facilitator.performProgressRedeem(
      progressRedeemParams.messageHash,
      progressRedeemParams.unlockSecret,
      progressRedeemParams.txOptions,
    );
    assert.strictEqual(
      result,
      true,
      'Result of performProgressRedeem must be true',
    );

    SpyAssert.assert(spyGetOutboxMessageStatus, 1, [
      [progressRedeemParams.messageHash],
    ]);
    SpyAssert.assert(spyProgressRedeem, 1, [
      [
        progressRedeemParams.messageHash,
        progressRedeemParams.unlockSecret,
        progressRedeemParams.txOptions,
      ],
    ]);
    SpyAssert.assert(spyCall, 1, [
      [
        progressRedeemParams.messageHash,
        progressRedeemParams.unlockSecret,
        progressRedeemParams.txOptions,
      ],
    ]);

    teardown();
  });
});
