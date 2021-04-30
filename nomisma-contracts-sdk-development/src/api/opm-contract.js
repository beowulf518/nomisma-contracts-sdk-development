import { genericEventFactory } from './events';
import { depositErcHelper } from './common';

export const getOpmBids = genericEventFactory({
  eventPropName: 'opmBidEventName',
  serializer: ({
    sender,
    collateral,
    strikePrice,
    notional,
    optionType,
    bidIdx,
    premiumPercentage,
    opm,
  }) => ({
    sender,
    collateral,
    strikePrice,
    notional,
    optionType,
    bidIdx,
    premiumPercentage,
    paired: false,
    opm,
  }),
});

export const getOpmPairs = genericEventFactory({
  eventPropName: 'opmPairedEventName',
  serializer: ({
    shortPutBidderAddress,
    shortPutBidIdx,
    shortPutTokenAddress,
    longCallBidderAddress,
    longCallBidIdx,
    longCallTokenAddress,
    transactionId,
    transactionMaturity,
    opm,
  }) => ({
    bidderOne: shortPutBidderAddress,
    bidderOneIdx: shortPutBidIdx,
    tokenOneAddress: shortPutTokenAddress,
    bidderTwo: longCallBidderAddress,
    bidderTwoIdx: longCallBidIdx,
    tokenTwoAddress: longCallTokenAddress,
    transactionId,
    transactionMaturity,
    opm,
  }),
});

export const getOpmBidsWithdrawn = genericEventFactory({
  eventPropName: 'opmBidWithdrawnEventName',
  serializer: ({ sender, bidIdx, opm }) => ({
    sender,
    bidIdx,
    opm,
  }),
});

export const getTransactionsSettled = genericEventFactory({
  eventPropName: 'opmTransactionSettledEventName',
  serializer: ({
    transactionId,
    opm,
  }) => ({
    transactionId,
    opm,
  }),
});

export const getRedeemsAvailable = genericEventFactory({
  eventPropName: 'opmRedeemAvailableEventName',
  serializer: ({
    optionExecutionToken,
    amount,
    opm,
  }) => ({
    optionExecutionToken,
    amount,
    opm,
  }),
});

export const getTokensRedeemed = genericEventFactory({
  eventPropName: 'opmTokensRedeemedEventName',
  serializer: ({
    optionExecutionToken,
    tokensAmount,
    assetAmount,
    beneficiary,
    opm,
  }) => ({
    optionExecutionToken,
    tokensAmount,
    assetAmount,
    beneficiary,
    opm,
  }),
});

export const getTokensMinted = genericEventFactory({
  eventPropName: 'tokensMintedEventName',
  serializer: ({
    destCurrencyAddress,
    rate,
    srcAmount,
    destAmount,
    opm,
  }) => ({
    destCurrencyAddress,
    rate,
    srcAmount,
    destAmount,
    resolved: false,
    opm,
  }),
});

export const getOpmDetails = ({ getContract, call }) => async ({ contractAddress, abi }) => {
  const contract = await getContract({
    contractAddress,
    abi,
  });

  const maturity = await call({
    contract,
    methodName: 'maturity',
    args: [],
  });

  return {
    maturity,
  };
};

export const getOpmBaseUnderlyingDetails = ({ getContract, call }) => async ({ contractAddress, abi }) => {
  const contract = await getContract({
    abi,
    contractAddress,
  });

  const { '0': base, '1': underlying } = await call({
    contract,
    methodName: 'getBaseUnderlying',
    args: [],
  });

  return {
    base,
    underlying,
  };
};

export const placeBid = ({
  getContract,
  getAccount,
  transactionSender,
  call,
}) => async ({
  contractAddress,
  abi,
  optionType,
  strikePrice,
  notional,
  value,
  tokenAddress,
  erc20Abi,
  amount,
  isEthereumTransfer,
  premiumPercentage,
}) => {
  const from = await getAccount();

  const gasEstimate = 800000;

  await depositErcHelper({
    isEthereumTransfer,
    erc20Abi,
    call,
    transactionSender,
    tokenAddress,
    from,
    amount,
    contractAddress,
    getContract,
    gasEstimate,
  });

  const contract = await getContract({
    contractAddress,
    abi,
  });

  const args = [strikePrice, optionType, notional, amount, premiumPercentage];

  return transactionSender({
    contract,
    methodName: 'bid',
    args,
    from,
    to: contractAddress,
    value,
    gas: gasEstimate,
  });
};

export const getOetDetails = ({ getContract, getAccount, call }) => async ({
  contractAddress,
  abi,
  opmAddress,
  opmAbi,
}) => {
  const contract = await getContract({
    abi,
    contractAddress,
  });

  const beneficiary = await getAccount();

  const [optionType, maturity, notional, base, underlying] = await Promise.all(
    ['optionType', 'maturity', 'notional', 'base', 'underlying'].map(async methodName =>
      call({
        contract,
        methodName,
        args: [],
      })
    )
  );

  const balance = await call({
    contract,
    methodName: 'balanceOf',
    args: [beneficiary],
  });

  const opm = await getContract({
    abi: opmAbi,
    contractAddress: opmAddress,
  });

  const withdrawal = await call({
    contract: opm,
    methodName: 'withdrawals',
    args: [contractAddress],
  });

  return {
    optionType,
    maturity,
    notional,
    base,
    underlying,
    balance,
    withdrawal,
  };
};

export const redeem = ({
  getContract,
  getAccount,
  transactionSender,
}) => async ({
  contractAddress,
  abi,
  amount,
  oetAddress,
  oetAbi,
  transactionId,
}) => {
  const contract = await getContract({
    contractAddress,
    abi,
  });

  const oetContract = await getContract({
    contractAddress: oetAddress,
    abi: oetAbi,
  });

  const from = await getAccount();

  const gasEstimate = 800000;

  await transactionSender({
    contract: oetContract,
    methodName: 'approve',
    args: [contractAddress, amount],
    gas: gasEstimate,
    from,
    to: oetAddress,
  });

  return transactionSender({
    contract,
    methodName: 'redeemTokens',
    args: [amount, oetAddress, transactionId],
    from,
    to: contractAddress,
    gas: gasEstimate,
  });
};
