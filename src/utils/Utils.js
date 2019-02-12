'use strict';

const Web3Utils = require('web3-utils');
const Web3 = require('web3');
const Crypto = require('crypto');

/**
 * This class includes the utitity functions.
 * @class
 * @classdesc Provides the common utility functions.
 */
class Utils {
  /**
   * @typedef {Object} HashLock
   *
   * @property {string} secret The string that was used to generate hash lock
   * and unlock secret.
   *
   * @property {string} unlockSecret The unlock secret string.
   *
   * @property {string} hashLock The hash lock.
   */

  /**
   * @function createSecretHashLock
   *
   * Creates a random secret string, unlock secrete and hashlock.
   *
   * @returns {HashLock} HashLock object.
   */
  static createSecretHashLock() {
    const secret = Crypto.randomBytes(16).toString('hex');
    return Utils.toHashLock(secret);
  }

  /**
   * @function toHashLock
   *
   * Returns the HashLock from the given secret string.
   *
   * @param {string} secretString The secret string.
   *
   * @returns {HashLock} HashLock object.
   */
  static toHashLock(secretString) {
    const unlockSecret = Web3Utils.keccak256(secretString);
    const hashLock = Web3Utils.keccak256(unlockSecret);
    return {
      secret: secretString,
      unlockSecret,
      hashLock,
    };
  }

  /**
   * Helper function to send ethereum transaction.
   *
   * @param {Object} tx Transaction object.
   * @param {Object} tx Transaction options.
   *
   * @returns {Promise} Promise object.
   */
  static async sendTransaction(tx, txOption) {
    return new Promise(async (onResolve, onReject) => {
      const txOptions = Object.assign({}, txOption);
      if (!txOptions.gas) {
        txOptions.gas = await tx.estimateGas(txOptions);
      }

      tx.send(txOptions)
        .on('transactionHash', (transactionHash) => {})
        .on('receipt', (receipt) => {
          return onResolve(receipt);
        })
        .on('error', (error) => {
          return onReject(error);
        })
        .catch((exception) => {
          return onReject(exception);
        });
    });
  }

  /**
   * Prints a deprecation warning for deprecated ChainSetup methods.
   * See {@link https://github.com/OpenSTFoundation/mosaic.js/issues/57}.
   */
  static deprecationNoticeChainSetup(method) {
    console.warn(
      `${method} has been deprecated. See https://github.com/OpenSTFoundation/mosaic.js/issues/57 for migration instructions.`,
    );
  }
}

module.exports = Utils;
