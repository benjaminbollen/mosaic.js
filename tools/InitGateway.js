'use strict';

const fs = require('fs'),
  Web3 = require('web3'),
  shell = require('shelljs'),
  os = require('os');
const DeployContract = require('../utils/deployContract'),
  helper = require('../utils/helper');

const originPassphrase = 'testtest',
  auxiliaryPassphrase = 'testtest';

const InitGateway = function() {
  const oThis = this;

  oThis.originWorkerContractAddress = null;
  oThis.auxiliaryWorkerContractAddress = null;

  oThis.configJsonFilePath = os.homedir() + '/mosaic-setup' + '/config.json';
};

InitGateway.prototype = {
  perform: async function() {
    const oThis = this;

    oThis._initVars();

    await oThis._deployCoGateway();
    await oThis._deployGateway();
  },

  _initVars: function() {
    const oThis = this;

    let configFileContent = JSON.parse(fs.readFileSync(oThis.configJsonFilePath, 'utf8'));

    oThis.auxiliaryWeb3 = new Web3(configFileContent.auxiliaryGethRpcEndPoint);
    oThis.originWeb3 = new Web3(configFileContent.originGethRpcEndPoint);
  },

  _deployCoGateway: async function() {
    const oThis = this;

    let configFileContent = JSON.parse(fs.readFileSync(oThis.configJsonFilePath, 'utf8'));

    console.log('Deploy co-gateway contract on value chain START.');

    await oThis.auxiliaryWeb3.eth.personal.unlockAccount(
      configFileContent.auxiliaryDeployerAddress,
      auxiliaryPassphrase
    );

    let contractName = 'CoGateway';
    let args = [
      configFileContent.erc20TokenContractAddress,
      //todo change to configFileContent.stPrimeContractAddress,
      configFileContent.auxiliaryCoreContractAddress,
      0, //todo need to add bounty in config
      configFileContent.auxiliaryOpsAddress //todo add organization address
      // in setup script
    ];

    console.log('args ', args);

    let auxiliaryCoGatewayContractDeployResponse = await new DeployContract({
      web3: oThis.auxiliaryWeb3,
      contractName: contractName,
      deployerAddress: configFileContent.auxiliaryDeployerAddress,
      gasPrice: '0x0',
      gas: configFileContent.auxiliaryGasLimit,
      abi: helper.getABI(contractName),
      bin: helper.getBIN(contractName),
      args: args
    }).deploy();

    console.log('auxiliaryCoGatewayContractDeployResponse:', auxiliaryCoGatewayContractDeployResponse);

    let gatewayContract = auxiliaryCoGatewayContractDeployResponse.instance;

    oThis.coGatewayContractAddress = auxiliaryCoGatewayContractDeployResponse.receipt.contractAddress;
    oThis._addConfig({ coGatewayContractAddress: oThis.coGatewayContractAddress });

    return gatewayContract;
  },

  _deployGateway: async function() {
    const oThis = this;

    let configFileContent = JSON.parse(fs.readFileSync(oThis.configJsonFilePath, 'utf8'));

    console.log('Deploy gateway contract on value chain START.');

    await oThis.originWeb3.eth.personal.unlockAccount(configFileContent.originDeployerAddress, originPassphrase);

    let contractName = 'Gateway';

    let originGatewayContractDeployResponse = await new deployContract({
      web3: oThis.originWeb3,
      contractName: contractName,
      deployerAddress: configFileContent.originDeployerAddress,
      gasPrice: '0x0',
      gas: configFileContent.originGasLimit,
      abi: helper.getABI(contractName),
      bin: helper.getBIN(contractName),
      args: [
        configFileContent.erc20TokenContractAddress,
        configFileContent.coGatewayContractAddress,
        configFileContent.originCoreContractAddress,
        0, //todo need to add bounty in config
        configFileContent.originOpsAddress //todo add organization address
        // in setup script
      ]
    }).deploy();

    console.log('originGatewayContractDeployResponse:', originGatewayContractDeployResponse);

    let gatewayContract = originGatewayContractDeployResponse.instance;

    oThis.gatewayContractAddress = originGatewayContractDeployResponse.receipt.contractAddress;
    oThis._addConfig({ gatewayContractAddress: oThis.gatewayContractAddress });

    return gatewayContract;
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

module.exports = InitGateway;
