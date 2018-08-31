'use strict';

const fs = require('fs'),
  os = require('os'),
  shell = require('shelljs');

const originPassphrase = 'testtest',
  auxiliaryPassphrase = 'testtest';

const Mosaic = require('../index');

const GatewayDeployer = function(config) {
  const oThis = this;
  oThis.configJsonFilePath = os.homedir() + '/mosaic-setup' + '/config.json';
  oThis.config = JSON.parse(fs.readFileSync(oThis.configJsonFilePath, 'utf8'));

  let mosaicConfig = {
    origin: {
      provider: oThis.config.originGethRpcEndPoint
    },
    auxiliaries: [
      {
        provider: oThis.config.auxiliaryGethRpcEndPoint,
        originCoreContractAddress: oThis.config.originCoreContractAddress
      }
    ]
  };

  oThis.mosaic = new Mosaic('', mosaicConfig);
};

GatewayDeployer.prototype = {
  deploy: async function() {
    const oThis = this;
    let config = oThis.config;

    let originConfig = {
        coreAddress: config.originCoreContractAddress,
        deployerAddress: config.originDeployerAddress,
        deployerPassPhrase: originPassphrase,
        gasPrice: config.originGasPrice,
        gasLimit: config.originGasLimit,
        token: config.erc20TokenContractAddress,
        bounty: 0,
        organisationAddress: config.originOrganizationAddress,
        messageBusAddress: config.originMessageBusContractAddress
      },
      //auxiliary
      auxiliaryConfig = {
        coreAddress: config.auxiliaryCoreContractAddress,
        deployerAddress: config.auxiliaryDeployerAddress,
        deployerPassPhrase: auxiliaryPassphrase,
        gasPrice: config.auxiliaryGasPrice,
        gasLimit: config.auxiliaryGasLimit,
        token: config.stPrimeContractAddress,
        bounty: 0,
        organisationAddress: config.auxiliaryOrganizationAddress,
        messageBusAddress: config.auxiliaryMessageBusContractAddress
      };

    let deployResult = await oThis.mosaic.setup.deployGateway(originConfig, auxiliaryConfig);
    let gatewayAddress = deployResult.gateway.receipt.contractAddress;
    let coGatewayAddress = deployResult.cogateway.receipt.contractAddress;
    console.log(` gateway ${gatewayAddress} , co-gateway ${coGatewayAddress}`);
    oThis._addConfig({
      gatewayAddress: gatewayAddress,
      coGatewayAddress: coGatewayAddress
    });
  },

  _addConfig: function(params) {
    const oThis = this;

    let fileContent = JSON.parse(fs.readFileSync(oThis.configJsonFilePath, 'utf8'));

    for (var i in params) {
      fileContent[i] = params[i];
    }

    oThis._executeInShell("echo '" + JSON.stringify(fileContent) + "' > " + oThis.configJsonFilePath);
  },

  _executeInShell: function(cmd) {
    let res = shell.exec(cmd);

    if (res.code !== 0) {
      shell.exit(1);
    }

    return res;
  }
};

module.exports = GatewayDeployer;
