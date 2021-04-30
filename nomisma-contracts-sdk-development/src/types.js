// eslint-disable-next-line no-unused-vars
import Web3 from 'web3';

/**
 * @global
 * @typedef {import('web3-eth-contract').Contract} Contract
 * @typedef {import('web3-eth-contract').AbiItemModel} AbiItemModel
 * @typedef {import('web3-core').Transaction} Transaction
 * @typedef {import('web3-core').TransactionReceipt} TransactionReceipt
 * @typedef {import('web3-core').EventLog} EventLog
 * @typedef {({ contract : Contract, methodName : string, args: Array }) => Promise} callContractMethod
 * @typedef {import('web3-utils').AbiItem} AbiItem
 * @typedef {import('web3-providers').BatchRequest} BatchRequest
 * @typedef {Web3} Web3
 *
 * @typedef {Object} TransactionSenderParams
 * @property {Contract} contract
 * @property {string} methodName
 * @property {Array} args
 * @property {string} from
 * @property {string} to
 * @property {any} value
 * @property {number} gas
 * @property {number} gasSurplus
 *
 * @typedef {Object} HOCParams
 * @property {() => Promise<Web3>} getWeb3
 * @property {(params : { contractAddress : string, abi : string }) => Promise<Contract>} getContract
 * @property {callContractMethod} call
 * @property {() => Promise<string>} getAccount
 * @property {(params : TransactionSenderParams) => Promise<TransactionReceipt>} transactionSender
 */
