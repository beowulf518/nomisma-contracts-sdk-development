import { ethers } from 'ethers';
import { arraysToMatrix } from '@nomisma/nomisma-smart-contract-helpers';
import { BigNumber } from '../bignumber';

/**
 *
 * @param {string} abi
 * @returns {Array<AbiItem>}
 */
const parseAbiItems = (abi) => JSON.parse(abi);
/**
 * @param {Array<AbiItem>} abiItems
 * @param {string} funcName
 * @returns {AbiItem}
 */
const getAbiItemByFuncName = (abiItems, funcName) => {
  const abiItem = abiItems.find(item => item.name === funcName);
  if (!abiItem) {
    throw new Error(`ABIItem of ${funcName} is not found`);
  }
  return abiItem;
};

/**
 * @typedef {import('../../types').AbiItem} AbiItem
 * @param {string} bankRegistryAbi
 * @returns {AbiItem}
 */
export const getBankDeployAbiItem = (bankRegistryAbi) => {
  return getAbiItemByFuncName(parseAbiItems(bankRegistryAbi), 'deployBank');
};

/**
 * @param {{ payload : string, deployBankAbiItem : AbiItem }} param
 */
export const parseBankDeployTransactionPayload = ({
  payload,
  deployBankAbiItem,
}) => {
  const { inputs: abiInputs } = deployBankAbiItem;
  const coder = new ethers.utils.AbiCoder();
  const result = coder.decode(abiInputs, '0x' + payload.slice(10));
  const {
    dateArgs,
    collaterals,
    ltvRates,
    interestRates,
    deployNumArgs,
    _loanToken: loanToken,
  } = result;
  const [
    expirationDate,
    lddInvestEquity,
    lddInvestDebt,
    lddBorrow,
  ] = dateArgs;
  const [
    minimumReserveRatio,
    ,
    debtInterest,
    ,
  ] = deployNumArgs;

  const matrix = arraysToMatrix(collaterals, ltvRates, interestRates);
  return {
    matrix,
    minimumReserveRatio,
    debtInterest,
    loanToken,
    lddInvestEquity,
    expirationDate,
    lddInvestDebt,
    lddBorrow,
  };
};

export const BankDeployConstantVars = {
  'RATE_PRECISION_MULTIPLIER': new BigNumber(10)
    .pow(new BigNumber(4))
    .toString(),
  'BASE_MULTIPLIER': new BigNumber(10)
    .pow(new BigNumber(18))
    .toString(),
  'MAX_LOANS': new BigNumber(30).toString(),
  'MAX_LOANS_PER_BORROWER': new BigNumber(5).toString(),
  'MACLAURIN_PRECISION': new BigNumber(18).toString(),
};
