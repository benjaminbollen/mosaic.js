'use strict';

const {
  sendTransaction,
  deprecationNoticeChainSetup,
} = require('../../utils/Utils');
const Organization = require('../../ContractInteract/Organization');

const WorkerExpirationHeight = '10000000';
class OrganizationHelper {
  constructor(web3, address) {
    this.web3 = web3;
    this.address = address;

    this.deploy = this.deploy.bind(this);
    this._deployRawTx = this._deployRawTx.bind(this);
  }

  deploy(
    owner,
    admin = '0x0000000000000000000000000000000000000000',
    workers,
    expirationHeight,
    txOptions,
    web3 = this.web3,
  ) {
    deprecationNoticeChainSetup('OrganizationHelper.deploy');
    const tx = this._deployRawTx(
      owner,
      admin,
      workers,
      expirationHeight,
      txOptions,
      web3,
    );

    const defaultOptions = {
      gas: '1600000',
    };
    const _txOptions = Object.assign({}, defaultOptions, txOptions);

    return sendTransaction(tx, _txOptions).then((txReceipt) => {
      this.address = txReceipt.contractAddress;
      return txReceipt;
    });
  }

  _deployRawTx(owner, admin, workers, expirationHeight, txOptions, web3) {
    deprecationNoticeChainSetup('OrganizationHelper._deployRawTx');
    const defaultOptions = {
      gas: '1600000',
    };

    if (txOptions) {
      Object.assign(defaultOptions, txOptions);
    }
    txOptions = defaultOptions;

    let _expirationHeight;
    if (workers) {
      if (!(workers instanceof Array)) {
        workers = [workers];
      }
      _expirationHeight = expirationHeight || WorkerExpirationHeight;
      _expirationHeight = String(_expirationHeight);
    } else {
      workers = [];
      _expirationHeight = '0';
    }

    return Organization.deployRawTx(
      web3,
      owner,
      admin,
      workers,
      _expirationHeight,
      txOptions,
    );
  }
}

module.exports = OrganizationHelper;
