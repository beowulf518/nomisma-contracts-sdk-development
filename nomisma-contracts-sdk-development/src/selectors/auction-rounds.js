// eslint-disable-next-line import/no-unresolved
import { BigNumber } from '../utils/bignumber';

const getRunningAndStateChangeInForAuctionRounds = ({
  initialAuctionTimestamp,
  startFreq,
  duration,
  currentDate = new Date(),
}) => {
  const nowBN = new BigNumber(
    `${Math.floor(currentDate.getTime() / 1000)}`
  );
  const durationBN = new BigNumber(
    duration
  );
  const initialAuctionTimestampBN = new BigNumber(initialAuctionTimestamp);
  const sinceStartBN = nowBN.sub(
    initialAuctionTimestampBN
  );

  let running;
  let stateChange;
  let cycleStart;
  let cycleEnd;
  let auctionIdx;

  if (sinceStartBN.isNeg()) {
    running = false;
    const stateChangeBN = initialAuctionTimestampBN.sub(nowBN);
    stateChange = stateChangeBN.toNumber();
    cycleStart = initialAuctionTimestampBN;
    cycleEnd = cycleStart.add(durationBN);
    auctionIdx = new BigNumber(0);
  } else {
    auctionIdx = sinceStartBN.div(
      new BigNumber(startFreq)
    );
    const startFreqBN = new BigNumber(
      startFreq
    );
    cycleStart = new BigNumber(initialAuctionTimestamp)
      .add(
        auctionIdx
          .mul(
            startFreqBN
          )
      );
    cycleEnd = cycleStart
      .add(
        durationBN
      );
    running = cycleStart.lte(nowBN) && cycleEnd.gt(nowBN);
    if (running) {
      stateChange = cycleStart
        .add(durationBN)
        .sub(nowBN)
        .toNumber();
    } else {
      stateChange = cycleStart
        .add(startFreqBN)
        .sub(nowBN)
        .toNumber();
    }
  }

  return {
    running,
    stateChange,
    cycleStart,
    cycleEnd,
    auctionIdx,
  };
};

export {
  BigNumber,
  getRunningAndStateChangeInForAuctionRounds,
};
