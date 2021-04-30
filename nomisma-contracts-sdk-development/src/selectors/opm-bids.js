import { generateOpmBidId } from '../utils/ids';
import { compatibleOptionTypes } from '../utils/option-types';

const findFirstMatchingBidForCondition = (
  bidConditionArr,
  optionType
) => {
  const result = bidConditionArr
    .findIndex(
      (
        {
          optionType: bidOptionType,
          matchId,
        }
      ) => (bidOptionType == compatibleOptionTypes[optionType]) && !matchId // eslint-disable-line eqeqeq
    );
  let toReturn;
  if (result === -1) {
    toReturn = null;
  } else {
    toReturn = result;
  }
  return toReturn;
};

export const conditionIdForBid = ({
  notional,
  strikePrice,
}) => `${notional}-${strikePrice}`;

export const getToBePairedBidIdsAndSortedBids = ({
  bidsArr,
  pairsArr,
}) => {
  const pairedBidIds = pairsArr.reduce(
    (
      acc,
      {
        bidderOne,
        bidderOneIdx,
        bidderTwo,
        bidderTwoIdx,
      }) => acc
      .concat(
        [
          generateOpmBidId({
            sender: bidderOne,
            bidIdx: bidderOneIdx,
          }),
          generateOpmBidId({
            sender: bidderTwo,
            bidIdx: bidderTwoIdx,
          }),
        ]
      ), []);
  const sortedBids = bidsArr.sort(
    (
      {
        timestamp: a,
      },
      {
        timestamp: b,
      }
    ) => a - b);
  const bidConditionsHash = {};
  sortedBids.forEach(({
    notional,
    strikePrice,
    optionType,
    bidIdx,
    sender,
    _id,
  }, idx) => {
    const id = generateOpmBidId({
      sender,
      bidIdx,
    });
    const conditionId = conditionIdForBid({
      notional,
      strikePrice,
    });

    if (bidConditionsHash[conditionId] && !pairedBidIds.includes(id)) {
      const matchingBidIdx = findFirstMatchingBidForCondition(
        bidConditionsHash[conditionId],
        optionType
      );
      if (typeof matchingBidIdx === 'number') {
        bidConditionsHash[conditionId][matchingBidIdx].matchId = id;
        bidConditionsHash[conditionId][matchingBidIdx].idx = idx;
        bidConditionsHash[conditionId][matchingBidIdx].match_id = _id;
      } else {
        bidConditionsHash[conditionId].push({
          optionType,
          id,
          _id,
        });
      }
    } else if (!pairedBidIds.includes(id)) {
      bidConditionsHash[conditionId] = [
        {
          optionType,
          id,
          _id,
        },
      ];
    }
  });

  return {
    pairedBidIds,
    bidConditionsHash,
    sortedBids,
  };
};
