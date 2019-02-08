# Run demo for `Stake & Mint` and `Redeem & Unstake`.
<!--
#### Install Package.
```js
npm install @openstfoundation/mosaic.js
```
-->

#### Populate the enviornment variables with RPC endpoint and addresses.
or update the content in `Demo/mosaic_config.sh`
```js
export ORIGIN_GETH_RPC_PROVIDER='http://localhost:8546'
export AUXILIARY_GETH_RPC_PROVIDER='http://localhost:8547'
export ANCHOR_ORIGIN='0x00000000000originanchorcontractaddress'
export ANCHOR_AUXILIARY='0x00000000auxiliaryanchorcontractaddress'
export EIP20GATEWAY='0x0000000000000eip20gatewaycontractaddress'
export EIP20COGATEWAY='0x00000000000eip20cogatewaycontractaddress'
export OSTPRIME='0x00000000000000000ostprimecontractaddress'
export ORIGIN_ANCHOR_WORKER_ADDRESS='0x0000000000000originanchorworkeraddress'
export ORIGIN_ANCHOR_WORKER_PASSWORD=''
export AUXILIARY_ANCHOR_WORKER_ADDRESS='0x0000000000auxiliaryanchorworkeraddress'
export AUXILIARY_ANCHOR_WORKER_PASSWORD=''
export ORIGIN_FACILITATOR_ADDRESS='0x00000000000000originfacilitatoraddress'
export ORIGIN_FACILITATOR_PASSWORD=''
export AUXILIARY_FACILITATOR_ADDRESS='0x00000000000auxiliaryfacilitatoraddress'
export AUXILIARY_FACILITATOR_PASSWORD=''
```
#### Start anchor worker
```js
source Demo/mosaic_config.sh 
node Demo/AnchorWorker.js
```
#### Using facilitator worker
```js
source Demo/mosaic_config.sh 

// The format to run the facilitator is as shown below.
node file_path [stake|redeem|redeemOSTPrime] amount beneficiary gasPrice gasLimit
```

#### Stake & Mint using facilitator worker
```js
source Demo/mosaic_config.sh 

// Example
node Demo/FacilitatorWorker.js stake 100000 '0x00000000000000000000beneficairyaddress' 0 0
```

#### Redeem & unstake using facilitator worker
```js
source Demo/mosaic_config.sh 

// Example for OSTPrime
node Demo/FacilitatorWorker.js redeemOSTPrime 100000 '0x00000000000000000000beneficairyaddress' 0 0

// Example for utility token
node Demo/FacilitatorWorker.js redeem 100000 '0x00000000000000000000beneficairyaddress' 0 0
```

