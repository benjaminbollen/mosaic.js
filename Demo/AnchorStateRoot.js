const Anchor = require('../src/ContractInteract/Anchor');
const TIME_DURATION = 10000;
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class AnchorStateRoot {
  constructor(mosaic) {
    console.log(
      'Anchor contract address on origin chain is: ',
      mosaic.origin.contractAddresses.Anchor,
    );
    console.log(
      'Anchor contract address on auxiliary chain is: ',
      mosaic.auxiliary.contractAddresses.Anchor,
    );

    this.mosaic = mosaic;
    this.originAnchor = new Anchor(
      mosaic.origin.web3,
      mosaic.origin.contractAddresses.Anchor,
    );
    this.auxiliaryAnchor = new Anchor(
      mosaic.auxiliary.web3,
      mosaic.auxiliary.contractAddresses.Anchor,
    );
    this.anchorOrigin = this.anchorOrigin.bind(this);
    this.anchorAuxiliary = this.anchorAuxiliary.bind(this);
    this.getOriginBlock = this.getOriginBlock.bind(this);
    this.getAuxiliaryBlock = this.getAuxiliaryBlock.bind(this);
    this.start = this.start.bind(this);
  }

  anchorOrigin() {
    return this.getAuxiliaryBlock().then((anchorInfo) => {
      console.log(
        `Anchoring auxiliary chain's state root: ${
          anchorInfo.stateRoot
        } for block number: ${anchorInfo.blockNumber} on origin chain`,
      );
      return this.originAnchor.anchorStateRoot(
        anchorInfo.blockNumber,
        anchorInfo.stateRoot,
        this.txOptionsOrigin,
      );
    });
  }

  anchorAuxiliary() {
    return this.getOriginBlock().then((anchorInfo) => {
      console.log(
        `Anchoring origin chain's state root: ${
          anchorInfo.stateRoot
        } for block number: ${anchorInfo.blockNumber} on auxiliary chain`,
      );
      return this.auxiliaryAnchor.anchorStateRoot(
        anchorInfo.blockNumber,
        anchorInfo.stateRoot,
        this.txOptionsAuxiliary,
      );
    });
  }

  getOriginBlock() {
    return this.mosaic.origin.web3.eth.getBlock('latest').then((block) => {
      return {
        blockNumber: `${block.number}`,
        stateRoot: block.stateRoot,
      };
    });
  }

  getAuxiliaryBlock() {
    return this.mosaic.auxiliary.web3.eth.getBlock('latest').then((block) => {
      return {
        blockNumber: `${block.number}`,
        stateRoot: block.stateRoot,
      };
    });
  }

  async start(
    txOptionsOrigin,
    txOptionsAuxiliary,
    originPassword,
    auxiliaryPassword,
  ) {
    this.txOptionsOrigin = txOptionsOrigin;
    this.txOptionsAuxiliary = txOptionsAuxiliary;
    this.originPassword = originPassword;
    this.auxiliaryPassword = auxiliaryPassword;
    this.commitOrigin();
  }

  stop() {
    // To be implemented.
  }

  async commitOrigin() {
    console.log(`Waiting for ${TIME_DURATION} milliseconds`);
    await sleep(TIME_DURATION);
    // await this.mosaic.origin.web3.personal.unlockAccount(
    //   this.txOptionsOrigin.from,
    //   this.originPassword,
    // );
    await this.anchorOrigin();
    this.commitAuxiliary();
  }

  async commitAuxiliary() {
    console.log(`Waiting for ${TIME_DURATION} milliseconds`);
    await sleep(TIME_DURATION);
    // await this.mosaic.auxiliary.web3.personal.unlockAccount(
    //   this.txOptionsAuxiliary.from,
    //   this.auxiliaryPassword,
    // );
    await this.anchorAuxiliary();
    this.commitOrigin();
  }
}

module.exports = AnchorStateRoot;
