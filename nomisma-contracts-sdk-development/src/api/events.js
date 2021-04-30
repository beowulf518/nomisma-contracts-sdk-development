import { mapTimestampToEventsMapped } from './block-timestamp';
import { convertBigNumberToString } from '../utils/web3-backward-compatible';

const getEventsGeneric = async ({
  abi,
  contractAddress,
  getContract,
  eventName,
  originBlock,
  serializer,
  getWeb3,
  getEnv,
  filters,
}) => {
  const contract = await getContract({
    abi,
    contractAddress,
  });

  const eventFilters = {
    fromBlock: originBlock,
    toBlock: 'latest',
  };

  if (filters) {
    eventFilters.filter = filters;
  }
  const events = await contract.getPastEvents(
    eventName,
    eventFilters
  );
  const web3 = await getWeb3();
  const eventsMapped = events.map(({
    event,
    returnValues,
    blockNumber,
    transactionHash,
  }) => ({
    blockNumber,
    transactionHash,
    eventName: event,
    ...serializer(convertBigNumberToString(returnValues, web3.utils.isBN)),
  }));
  return mapTimestampToEventsMapped({
    getWeb3,
    getEnv,
  })(
    eventsMapped
  );
};

export const genericEventFactory = ({
  eventPropName,
  serializer,
}) => ({
  [eventPropName]: eventName,
  getContract,
  getWeb3,
  getEnv,
}) => ({
  contractAddress,
  abi,
  originBlock,
  filters,
}) => getEventsGeneric({
  contractAddress,
  abi,
  getContract,
  eventName,
  originBlock,
  getWeb3,
  serializer,
  getEnv,
  filters,
});

