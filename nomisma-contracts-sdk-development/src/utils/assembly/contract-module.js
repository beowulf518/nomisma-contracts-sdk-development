/**
 * @typedef {import('web3-core-method').AbstractMethod} AbstractMethod
 * @typedef {import('../../types').AbiItemModel} AbiItemModel
 * @typedef {import('../../types').AbiItem} AbiItem
 * @typedef {import('../../types').Web3} Web3
 * @typedef {import('../../types').BatchRequest} BatchRequest
 * @typedef {import('../../types').Contract} Contract
 */
export const noop = () => undefined;

/**
 * @param {Web3} web3
 * @param {{ [k : string] : Array<AbstractMethod> }} methodsMap
 * @returns {Promise<{ [k : string] : Array }>}
 */
export const executeBatch = async (web3, methodsMap) => {
  const {
    batch: batchRequest,
    margins: marginsOfKeys,
  } = Object.entries(methodsMap).reduce(
    /**
     * @param {{ batch : BatchRequest, count : number, margins : { [k : string] : [number, number] } }} reduced
     */
    ({ batch, count, margins }, [key, methods]) => {
      // web3 uses OOP, thus function context should be preserved
      methods.forEach(method => batch.add(method));
      margins[key] = [count, count + methods.length];
      return { batch, margins, count: count + methods.length };
    },
    { batch: new web3.BatchRequest(), count: 0, margins: {} },
  );
  const result = await batchRequest.execute();

  if (Array.isArray(result)) {
    const error = new Error('Error occurred during getBanksStates()');
    error.meta = result;
    throw error;
  }

  const { response } = result;
  return Object.keys(methodsMap).reduce(
    (reducedResponse, key) => {
      reducedResponse[key] = response.slice(...marginsOfKeys[key]);
      return reducedResponse;
    }, {},
  );
};

/**
 * @param {Contract} contract
 * @param {string} methodName
 * @param {Array<any>} params
 *
 * @returns {AbstractMethod}
 */
export const createContractCallMethod = (
  contract,
  methodName,
  ...params
) => {
  /**
   * @type {AbstractMethod}
   */
  const method = contract.methods[methodName](...params).call.request();
  method.callback = noop;
  return method;
};
