const Web3 = require('web3');
const Mosaic = require('../src/Mosaic');
const Chain = require('../src/Chain');
const EIP20Gateway = require('../src/ContractInteract/EIP20Gateway');
const EIP20CoGateway = require('../src/ContractInteract/EIP20CoGateway');

function run() {
  const args = process.argv.slice(2);

  const originWeb3Provider = process.env.ORIGIN_GETH_RPC_PROVIDER;
  const auxiliaryWeb3Provider = process.env.AUXILIARY_GETH_RPC_PROVIDER;
  const originFacilitatorAddress = process.env.ORIGIN_FACILITATOR_ADDRESS;
  const auxiliaryFacilitatorAddress =
    process.env.AUXILIARY_FACILITATOR_ADDRESS;
}
