import { deserializeDateKeeperReturnPayload } from '@nomisma/nomisma-smart-contract-helpers';
import { BigNumber } from '../utils/bignumber';

/**
 * @typedef {import('../types').HOCParams} HOCParams
 * @typedef {import('../types').Transaction} Transaction
 * @typedef {import('../types').BatchRequest} BatchRequest
 */

export const getValidatorInfo = ({
  getContract,
  call,
}) => async ({
  contractAddress,
  abi,
}) => {
  const dateKeeper = await getContract({
    abi,
    contractAddress,
  });

  return call({
    contract: dateKeeper,
    methodName: 'getValidatorInfo',
    args: [],
  });
};

/**
 * @param {HOCParams} HOCParams
 *
 * @typedef {Object} Params
 * @property {string} contractAddress
 * @property {string} abi
 * @returns {(params : Params) => Promise<Result>}
 *
 * @typedef {Object} Result
 * @property {string} initialTimestamp
 * @property {string} weeksInTheFutureEnabled
 * @property {string} weeklyIntervalStart
 * @property {string} weeklyIntervalEnd
 * @property {string} granularity
 * @property {string} minIntervalSinceBankDeployment
 * @property {FixDates} fixedDates
 *
 * @typedef {Object} FixDates
 * @property {Array<string>} dates
 * @property {Array<string>} datesIntervalStarts
 * @property {Array<string>} datesIntervalEnds
 */
export const getDateKeeperDetails = ({
  getContract,
  call,
}) => async ({
  contractAddress,
  abi,
}) => {
  const {
    '0': validatorAddresses,
    '1': validatorTypes,
    '2': validatorStates,
  } = await getValidatorInfo({
    getContract,
    call,
  })({
    contractAddress,
    abi,
  });

  const dateKeeperState = deserializeDateKeeperReturnPayload({
    payload: validatorStates,
    BigNumber,
    validatorTypes,
  });

  return {
    validatorAddresses,
    validatorTypes,
    dateKeeperState,
  };
};
