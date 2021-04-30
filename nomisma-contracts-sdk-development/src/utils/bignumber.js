import { BN as BigNumber } from 'web3-utils';

const sumBigNumbers = (xs) => {
  return xs.reduce(
    (acc, cur) => acc.add(new BigNumber(cur)),
    new BigNumber(0)
  );
};

export {
  BigNumber,
  sumBigNumbers,
};
