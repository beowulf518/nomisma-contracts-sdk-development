import { depositErcHelper } from '../common';

/**
 * @typedef {import('../../types').HOCParams} HOCParams
 * @typedef {import('../../types').TransactionReceipt} TransactionReceipt
 */

/**
 * @param {import('../../types').HOCParams} HOCParams
 * @typedef {Object} Params
 * @property {string} contractAddress
 * @property {string} abi
 * @property {string} tokenAddress
 * @property {string} amount
 * @returns {(params : Params) => Promise<TransactionReceipt>}
 */
export const deposit = ({
  getContract,
  getAccount,
  transactionSender,
  call,
}) => async ({
  isEthereumTransfer,
  contractAddress,
  abi,
  tokenAddress,
  erc20Abi,
  amount,
  tokenManagerContractAddress,
}) => {
  const ccpFundLockContract = await getContract({
    abi,
    contractAddress,
  });

  const from = await getAccount();

  const gasEstimate = 800000;

  await depositErcHelper({
    isEthereumTransfer,
    erc20Abi,
    call,
    transactionSender,
    tokenAddress,
    from,
    amount,
    contractAddress: tokenManagerContractAddress,
    getContract,
    gasEstimate,
  });

  return transactionSender({
    contract: ccpFundLockContract,
    methodName: 'deposit',
    args: [
      tokenAddress,
      amount,
    ],
    gas: gasEstimate,
    from,
    value: isEthereumTransfer ? amount : '0',
    to: contractAddress,
  });
};

/**
 * @param {import('../../types').HOCParams} HOCParams
 * @typedef {Object} Params
 * @property {string} contractAddress
 * @property {string} abi
 * @property {string} tokenAddress
 * @property {string} amount
 * @returns {(params : Params) => Promise<TransactionReceipt>}
 */
export const withdraw = ({
  getContract,
  getAccount,
  transactionSender,
}) => async ({
  contractAddress,
  abi,
  tokenAddress,
  amount,
}) => {
  const ccpFundLockContract = await getContract({
    abi,
    contractAddress,
  });
  const from = await getAccount();
  const gasEstimate = 800000;

  return transactionSender({
    contract: ccpFundLockContract,
    methodName: 'withdraw',
    args: [
      tokenAddress,
      amount,
    ],
    gas: gasEstimate,
    from,
    to: contractAddress,
  });
};

/**
 * @param {import('../../types').HOCParams} HOCParams
 * @typedef {Object} Params
 * @property {string} contractAddress
 * @property {string} abi
 * @property {string} tokenAddress
 * @property {number} withdrawTimestamp
 * @property {string} amount
 * @returns {(params : Params) => Promise<TransactionReceipt>}
 */
export const release = ({
  getContract,
  getAccount,
  transactionSender,
}) => async ({
  contractAddress,
  abi,
  tokenAddress,
  withdrawTimestamp,
}) => {
  const ccpFundLockContract = await getContract({
    abi,
    contractAddress,
  });
  const from = await getAccount();
  const gasEstimate = 800000;

  return transactionSender({
    contract: ccpFundLockContract,
    methodName: 'release',
    args: [
      tokenAddress,
      withdrawTimestamp,
    ],
    gas: gasEstimate,
    from,
    to: contractAddress,
  });
};
