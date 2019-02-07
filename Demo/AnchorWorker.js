const Web3 = require('web3');
const Mosaic = require('../src/Mosaic');
const Chain = require('../src/Chain');
const AnchorStateRoot = require('./AnchorStateRoot');

let anchorStateRoot;
function run() {
  const anchorOrigin = process.env.ANCHOR_ORIGIN;
  const anchorAuxiliary = process.env.ANCHOR_AUXILIARY;
  const originWeb3Provider = process.env.ORIGIN_GETH_RPC_PROVIDER;
  const auxiliaryWeb3Provider = process.env.AUXILIARY_GETH_RPC_PROVIDER;
  const originWorkerAddress = process.env.ORIGIN_ANCHOR_WORKER_ADDRESS;
  const auxiliaryWorkerAddress = process.env.AUXILIARY_ANCHOR_WORKER_ADDRESS;
  const originWorkerPassword = process.env.ORIGIN_ANCHOR_WORKER_PASSWORD;
  const auxiliaryWorkerPassword = process.env.AUXILIARY_ANCHOR_WORKER_PASSWORD;

  const originContractAddresses = {
    Anchor: anchorOrigin,
  };

  const auxiliaryContractAddresses = {
    Anchor: anchorAuxiliary,
  };
  const txOptionOrigin = {
    from: originWorkerAddress,
    gas: '7500000',
  };

  const txOptionAuxiliary = {
    from: auxiliaryWorkerAddress,
    gas: '7500000',
  };
  const originWeb3 = new Web3(originWeb3Provider);
  const originChain = new Chain(originWeb3, originContractAddresses);
  const auxiliaryWeb3 = new Web3(auxiliaryWeb3Provider);
  const auxiliaryChain = new Chain(auxiliaryWeb3, auxiliaryContractAddresses);

  const mosaic = new Mosaic(originChain, auxiliaryChain);

  anchorStateRoot = new AnchorStateRoot(mosaic);
  anchorStateRoot.start(
    txOptionOrigin,
    txOptionAuxiliary,
    originWorkerPassword,
    auxiliaryWorkerPassword,
  );
}
run();
