import { getBlockTimestampSafe } from './block-timestamp';

export const getAuctionRoundDetails = ({
  getContract,
  getWeb3,
  call,
}) => async ({
  contractAddress,
  abi,
}) => {
  const contract = await getContract({
    contractAddress,
    abi,
  });
  const {
    _startFreq,
    _duration,
    _initialAuctionTimestamp,
  } = await call({
    contract,
    methodName: 'getAuctionRoundParams',
    args: [],
  });
  const blockTimestamp = await getBlockTimestampSafe({
    getWeb3,
  })('latest');
  const currentDate = new Date(blockTimestamp * 1000);
  return {
    startFreq: _startFreq,
    duration: _duration,
    initialAuctionTimestamp: _initialAuctionTimestamp,
    currentDate,
  };
};
