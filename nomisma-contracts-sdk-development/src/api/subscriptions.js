import { mapTimestampToEventsMapped } from './block-timestamp';

const emitters = [];

/**
 * @typedef {import('../types').EventLog} EventLog
 * @typedef {import('../types').AbiItemModel} AbiItemModel
 * @typedef {(data : EventLog) => any} EventLogHandler
 * @param {import('../types').Contract} contract
 * @returns {(hashFn : Function) => { [k : string] : EventLogHandler }}
 */
const getContractEventHashBuilderFactory = (contract) => {
  const allEventsAbiItemModels = Object.values(contract.jsonInterface.getEvents());
  /**
   * @type {{ [k : string] : (hashFn : Function) => EventLogHandler }}
   */
  const uniqueEventsHashBuilders = allEventsAbiItemModels.reduce(
    /**
     * @param {{ [k : string] : (hashFn : Function) => EventLogHandler }} reduced
     * @param {AbiItemModel} nextItemModel
     */
    (reduced, nextItemModel) => {
      if (reduced[nextItemModel.name]) {
        return reduced;
      }
      reduced[nextItemModel.name] = (hashFunc) => (data) => {
        const hashFuncParams = nextItemModel.getInputs()
          .map(({ name, type }) => ({ type, name, value: data.returnValues[name] }))
          .sort((a, b) => a.name < b.name ? 1 : -1);
        return hashFunc(...hashFuncParams, {
          type: 'string',
          value: data.transactionHash,
        });
      };
      return reduced;
    },
    {},
  );
  return hashFunc => Object.entries(uniqueEventsHashBuilders)
    .reduce(
      (acc, [key, hashFactory]) => ({ ...acc, [key]: hashFactory(hashFunc)}),
      {},
    );
};

const getMappedSubscriptionEvent = async ({
  serializer,
  getWeb3,
  getEnv,
  event,
}) => {
  const {
    event: eventName,
    blockNumber,
    transactionHash,
  } = event;
  const mappedEvent = {
    blockNumber,
    transactionHash,
    eventName,
    ...serializer(event),
  };
  // This helper works with arrays however with subscriptions
  // we serialise events one by one so we are mimicking array here.
  const events = await mapTimestampToEventsMapped({
    getWeb3,
    getEnv,
  })([mappedEvent]);
  return events[0];
};

export const subscribe = ({
  getWeb3,
  getEnv,
  getContract,
}) => async ({
  contractAddress,
  abi,
  filters,
  eventName = '',
  serializer = payload => payload.returnValues, // default to returning whole event
}) => {
  const contract = await getContract({
    contractAddress,
    abi,
  });
  const web3 = await getWeb3();
  const localEventDb = {};
  const hashBuilderFactory = getContractEventHashBuilderFactory(
    contract
  );
  const hashBuilder = hashBuilderFactory(web3.utils.soliditySha3);

  return sagaEmitter => {
    // https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#events-allevents
    const options = {
      fromBlock: 'latest',
    };
    if (filters) {
      options.filter = filters;
    }
    const emitter = eventName
      ? contract.events[eventName](options)
      : contract.events.allEvents(options);

    emitter.on('data', async (data) => {
      const eventHash = hashBuilder[data.event](data);
      if (!localEventDb[eventHash]) {
        localEventDb[eventHash] = true;
        const parsedEvent = await getMappedSubscriptionEvent({
          event: data,
          serializer,
          getWeb3,
          getEnv,
        });
        sagaEmitter(parsedEvent);
      }
    }).on('error', (error) => {
      throw error;
    });
    emitters.push(emitter);
    return () => {
      emitter.unsubscribe();
    };
  };
};

export const scheduleUnsubscribeAll = () => () => {
  if (!!window && !!window.addEventListener) {
    window.addEventListener('beforeunload', () => {
      emitters.forEach(emitter => {
        emitter.unsubscribe();
      });
    });
  }
};
