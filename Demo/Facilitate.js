const BN = require('bn.js');
const Anchor = require('../src/ContractInteract/Anchor.js');
const Facilitator = require('../src/Facilitator/Facilitator');
const OSTPrime = require('../src/ContractInteract/OSTPrime');

const TIME_DURATION = 10000;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class Facilitate {
  constructor(
    mosaic,
    txOptionsOrigin,
    txOptionsAuxiliary,
    originPassword,
    auxiliaryPassword,
  ) {
    console.log(
      'EIP20Gateway contract address on origin chain is: ',
      mosaic.origin.contractAddresses.EIP20Gateway,
    );
    console.log(
      'EIP20CoGateway contract address on auxiliary chain is: ',
      mosaic.auxiliary.contractAddresses.EIP20CoGateway,
    );
    console.log(
      'Anchor contract address on origin chain is: ',
      mosaic.origin.contractAddresses.Anchor,
    );
    console.log(
      'Anchor contract address on auxiliary chain is: ',
      mosaic.auxiliary.contractAddresses.Anchor,
    );
    this.mosaic = mosaic;
    this.facilitator = new Facilitator(mosaic);
    this.originAnchor = new Anchor(
      mosaic.origin.web3,
      mosaic.origin.contractAddresses.Anchor,
    );
    this.auxiliaryAnchor = new Anchor(
      mosaic.auxiliary.web3,
      mosaic.auxiliary.contractAddresses.Anchor,
    );
    this.txOptionsOrigin = txOptionsOrigin;
    this.txOptionsAuxiliary = txOptionsAuxiliary;
    this.originPassword = originPassword;
    this.auxiliaryPassword = auxiliaryPassword;

    this.stake = this.stake.bind(this);
    this.redeem = this.redeem.bind(this);
    this.redeemOSTPrime = this.redeemOSTPrime.bind(this);
  }

  stake(staker, amount, beneficiary, gasPrice, gasLimit) {
    const generatedHashLock = this.facilitator.getHashLock();
    return this.getOriginChainNonce(staker).then((nonce) => {
      console.log('nonce: ', nonce);
      return this.facilitator
        .stake(
          staker,
          amount,
          beneficiary,
          gasPrice,
          gasLimit,
          generatedHashLock.hashLock,
          this.txOptionsOrigin,
        )
        .then((receipt) => {
          console.log('receipt: ', receipt);

          return this.waitForStateRootCommit(
            this.auxiliaryAnchor,
            receipt.blockNumber,
          ).then(() =>
            this.facilitator.progressStake(
              staker,
              amount,
              beneficiary,
              gasPrice,
              gasLimit,
              nonce,
              generatedHashLock.hashLock,
              generatedHashLock.unlockSecret,
              this.txOptionsOrigin,
              this.txOptionsAuxiliary,
            ),
          );
        });
    });
  }

  redeem(redeemer, amount, beneficiary, gasPrice, gasLimit) {
    const generatedHashLock = this.facilitator.getHashLock();

    return this.getAuxiliaryChainNonce(redeemer).then((nonce) => {
      console.log('nonce: ', nonce);
      return this.facilitator.coGateway.getBounty().then((bounty) => {
        console.log('bounty: ', bounty);
        const txOptionsAuxiliaryWithValue = Object.assign(
          { value: bounty },
          this.txOptionsAuxiliary,
        );
        return this.facilitator
          .redeem(
            redeemer,
            amount,
            beneficiary,
            gasPrice,
            gasLimit,
            generatedHashLock.hashLock,
            txOptionsAuxiliaryWithValue,
          )
          .then((receipt) => {
            console.log('receipt: ', receipt);
            return this.waitForStateRootCommit(
              this.originAnchor,
              receipt.blockNumber,
            ).then(() =>
              this.facilitator.progressRedeem(
                redeemer,
                nonce,
                beneficiary,
                amount,
                gasPrice,
                gasLimit,
                generatedHashLock.hashLock,
                generatedHashLock.unlockSecret,
                this.txOptionsOrigin,
                this.txOptionsAuxiliary,
              ),
            );
          });
      });
    });
  }

  redeemOSTPrime(redeemer, amount, beneficiary, gasPrice, gasLimit) {
    const prime = new OSTPrime(
      this.mosaic.auxiliary.web3,
      this.mosaic.auxiliary.contractAddresses.OSTPrime,
    );
    const txOptionsAuxiliaryWithValue = Object.assign(
      { value: amount },
      this.txOptionsAuxiliary,
    );
    return prime
      .wrap(txOptionsAuxiliaryWithValue)
      .then(() =>
        this.redeem(redeemer, amount, beneficiary, gasPrice, gasLimit),
      );
  }

  async waitForStateRootCommit(anchor, blockNumber) {
    let shouldWait = true;
    const transactionBlockNumber = new BN(blockNumber);
    console.log(
      `Waiting for ${TIME_DURATION} milliseconds to check for state root commit`,
    );
    try {
      const latestBlockHeight = new BN(
        await anchor.getLatestStateRootBlockHeight(),
      );
      console.log(
        'Latest anchored block height is: ',
        latestBlockHeight.toString(10),
      );
      shouldWait = transactionBlockNumber.gte(latestBlockHeight);
      if (shouldWait) {
        await sleep(TIME_DURATION);
        await this.waitForStateRootCommit(anchor, blockNumber);
      }
    } catch (e) {
      console.log('Exception while getting the latest block height');
      return Promise.reject(e);
    }
    console.log('Latest state root is anchored.');
    return Promise.resolve(true);
  }

  // async waitForStateRootCommit(anchor, blockNumber) {
  //   let shouldWait = true;
  //   const transactionBlockNumber = new BN(blockNumber);
  //   while (shouldWait) {
  //     console.log(`Waiting for ${TIME_DURATION} milliseconds to check for state root commit`);
  //     sleep(TIME_DURATION);
  //     try {
  //       const latestBlockHeight = new BN(await anchor.getLatestStateRootBlockHeight());
  //       console.log('Latest anchored block height is: ', latestBlockHeight.toString(10));
  //       shouldWait = transactionBlockNumber.gte(latestBlockHeight);
  //     } catch (e) {
  //       console.log('Exception while getting the latest block height');
  //       return Promise.reject(e);
  //     }
  //   }
  //   console.log('Latest state root is anchored.');
  //   return Promise.resolve(true);
  // }

  getOriginChainNonce(address) {
    return this.facilitator.gateway.getNonce(address);
  }

  getAuxiliaryChainNonce(address) {
    return this.facilitator.coGateway.getNonce(address);
  }
}

module.exports = Facilitate;
