
let blockNumberToTimestampCache = {};

const timeOut = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getBlockTimestampSafe = ({
  getWeb3,
}) => async (
  blockNumber
) => {
  const web3 = await getWeb3();
  let toReturn;
  try {
    const {
      timestamp,
    } = await web3.eth.getBlock(blockNumber);
    toReturn = timestamp;
  } catch (e) {
    await timeOut(2500);
    toReturn = getBlockTimestampSafe({
      getWeb3,
    })(
      blockNumber
    );
  }
  return toReturn;
};

export const mapTimestampToEventsMapped = ({
  getWeb3,
  getEnv,
}) => async eventsMapped => {
  let localTimestampCache = {
    ...blockNumberToTimestampCache,
  }; // clone to ensure proper behaviour in tests
  const blockNumbersRequest = eventsMapped.reduce(
    (
      acc,
      {
        blockNumber,
      }
    ) => {
      let toReturn;
      if (
        localTimestampCache[blockNumber]
        || acc.includes(blockNumber)
      ) {
        toReturn = acc;
      } else {
        toReturn = acc.concat(blockNumber);
      }
      return toReturn;
    }, []);
  if (blockNumbersRequest.length) {
    const resultTimestampCache = await blockNumbersRequest.reduce(
      async (
        acc,
        blockNumber
      ) => {
        const newAcc = await acc;
        const timestamp = await getBlockTimestampSafe({
          getWeb3,
        })(
          blockNumber
        );
        return {
          ...newAcc,
          [blockNumber]: timestamp,
        };
      }, Promise.resolve({}));
    localTimestampCache = {
      ...localTimestampCache,
      ...resultTimestampCache,
    }; // concat with local
  }
  const toReturn = eventsMapped.map((event) => ({
    ...event,
    timestamp: localTimestampCache[event.blockNumber],
  }));
  if (!getEnv || getEnv() !== 'test') {
    blockNumberToTimestampCache = {
      ...blockNumberToTimestampCache,
      ...localTimestampCache,
    }; // concat local with global
  }
  return toReturn;
};
