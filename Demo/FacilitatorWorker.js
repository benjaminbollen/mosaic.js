const Web3 = require('web3');
const Mosaic = require('../src/Mosaic');
const Chain = require('../src/Chain');
const Facilitate = require('./Facilitate');

function run() {
  const args = process.argv.slice(2);

  if (args.length !== 5) {
    console.log('Mandatory params are missing.');
    console.log(
      'The format to run is: `node file_path [stake|redeem|redeemOSTPrime] amount beneficiary gasPrice gasLimit`',
    );
    console.log(
      'Example: node FacilitatorWorker stake 100000 0x4ddebcebe274751dfb129efc96a588a5242530ab 1 1000000',
    );
    process.exit(1);
  }

  if (!['stake', 'redeem', 'redeemOSTPrime'].includes(args[0])) {
    console.log(`Unknown command: ${args[0]}`);
    console.log(
      'The format to run is: `node file_path [stake|redeem|redeemOSTPrime] amount beneficiary gasPrice gasLimit`',
    );
    console.log(
      'Example: node FacilitatorWorker stake 100000 0x4ddebcebe274751dfb129efc96a588a5242530ab 1 1000000',
    );
    process.exit(1);
  }

  const originWeb3Provider = process.env.ORIGIN_GETH_RPC_PROVIDER;
  const auxiliaryWeb3Provider = process.env.AUXILIARY_GETH_RPC_PROVIDER;
  const originFacilitatorAddress = process.env.ORIGIN_FACILITATOR_ADDRESS;
  const auxiliaryFacilitatorAddress =
    process.env.AUXILIARY_FACILITATOR_ADDRESS;
  const originFacilitatorPassword = process.env.ORIGIN_FACILITATOR_PASSWORD;
  const auxiliaryFacilitatorPassword =
    process.env.AUXILIARY_FACILITATOR_PASSWORD;

  const originContractAddresses = {
    EIP20Gateway: process.env.EIP20GATEWAY,
    Anchor: process.env.ANCHOR_ORIGIN,
  };

  const auxiliaryContractAddresses = {
    EIP20CoGateway: process.env.EIP20COGATEWAY,
    OSTPrime: process.env.OSTPRIME,
    Anchor: process.env.ANCHOR_AUXILIARY,
  };
  const txOptionOrigin = {
    from: originFacilitatorAddress,
    gas: '7500000',
  };

  const txOptionAuxiliary = {
    from: auxiliaryFacilitatorAddress,
    gas: '7500000',
  };
  console.log('txOptionOriginL: ', txOptionOrigin);
  console.log('txOptionAuxiliary: ', txOptionAuxiliary);
  const originWeb3 = new Web3(originWeb3Provider);
  const originChain = new Chain(originWeb3, originContractAddresses);
  const auxiliaryWeb3 = new Web3(auxiliaryWeb3Provider);
  const auxiliaryChain = new Chain(auxiliaryWeb3, auxiliaryContractAddresses);

  const mosaic = new Mosaic(originChain, auxiliaryChain);

  const facilitate = new Facilitate(
    mosaic,
    txOptionOrigin,
    txOptionAuxiliary,
    originFacilitatorPassword,
    auxiliaryFacilitatorPassword,
  );
  const amount = `${args[1]}`;
  const beneficiary = `${args[2]}`;
  const gasPrice = `${args[3]}`;
  const gasLimit = `${args[4]}`;

  if (args[0] === 'stake') {
    facilitate
      .stake(txOptionOrigin.from, amount, beneficiary, gasPrice, gasLimit)
      .then(console.log)
      .catch(console.log);
  } else if (args[0] === 'redeem') {
    facilitate
      .redeem(txOptionAuxiliary.from, amount, beneficiary, gasPrice, gasLimit)
      .then(console.log)
      .catch(console.log);
  } else if (args[0] === 'redeemOSTPrime') {
    facilitate
      .redeemOSTPrime(
        txOptionAuxiliary.from,
        amount,
        beneficiary,
        gasPrice,
        gasLimit,
      )
      .then(console.log)
      .catch(console.log);
  }
}
run();
