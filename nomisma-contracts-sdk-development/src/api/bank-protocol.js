import { sumBigNumbers, BigNumber } from '../utils/bignumber';
import { baseMultiplierBN } from '../utils/base-multiplier';
import { genericEventFactory } from './events';
import {
  checkInvalidTokenBalance,
  depositErcHelper,
} from './common';
import { aggregate } from '@makerdao/multicall';
import {
  parseBankDeployTransactionPayload,
  getBankDeployAbiItem,
  BankDeployConstantVars,
} from '../utils/assembly';
import {
  executeBatch,
  createContractCallMethod,
  noop,
} from '../utils/assembly/contract-module';
import { toBN } from 'web3-utils';


/**
 * @typedef {import('../types').HOCParams} HOCParams
 * @typedef {import('../types').Transaction} Transaction
 * @typedef {import('../types').BatchRequest} BatchRequest
 */
export const depositEquity = ({
  getContract,
  getAccount,
  transactionSender,
  call,
}) => async ({
  contractAddress,
  abi,
  amount,
  value,
  isEthereumLoan,
  commission,
  erc20Abi,
  loanTokenAddress,
  tokenManagerContractAddress,
}) => {
  const contract = await getContract({
    abi,
    contractAddress,
  });

  const from = await getAccount();

  const gasEstimate = 800000;

  await depositErcHelper({
    isEthereumTransfer: isEthereumLoan,
    erc20Abi,
    call,
    transactionSender,
    tokenAddress: loanTokenAddress,
    from,
    amount: new BigNumber(amount)
      .add(
        new BigNumber(commission)
      )
      .toString(),
    contractAddress: tokenManagerContractAddress,
    getContract,
    gasEstimate,
  });

  return transactionSender({
    contract,
    methodName: 'depositEquity',
    args: [amount, commission],
    gas: gasEstimate,
    from,
    value,
    to: contractAddress,
  });
};

export const depositDebt = ({
  getContract,
  getAccount,
  transactionSender,
  call,
}) => async ({
  contractAddress,
  abi,
  amount,
  commission,
  value,
  isEthereumLoan,
  erc20Abi,
  loanTokenAddress,
  tokenManagerContractAddress,
}) => {
  const contract = await getContract({
    abi,
    contractAddress,
  });

  const from = await getAccount();

  const gasEstimate = 800000;

  await depositErcHelper({
    isEthereumTransfer: isEthereumLoan,
    erc20Abi,
    call,
    transactionSender,
    tokenAddress: loanTokenAddress,
    from,
    amount: new BigNumber(amount)
      .add(
        new BigNumber(commission)
      )
      .toString(),
    contractAddress: tokenManagerContractAddress,
    getContract,
    gasEstimate,
  });

  return transactionSender({
    contract,
    methodName: 'depositDebt',
    args: [amount, commission],
    gas: gasEstimate,
    from,
    value,
    to: contractAddress,
  });
};

export const borrow = ({
  getContract,
  getAccount,
  transactionSender,
  call,
}) => async ({
  contractAddress,
  abi,
  collateralTokenAddress,
  collateralAmount,
  collateralIdx,
  erc20Abi,
  value,
  isEthereumTransfer,
  tokenManagerContractAddress,
}) => {
  const from = await getAccount();

  const gasEstimate = 800000;

  await depositErcHelper({
    isEthereumTransfer,
    erc20Abi,
    call,
    transactionSender,
    tokenAddress: collateralTokenAddress,
    from,
    amount: collateralAmount,
    contractAddress: tokenManagerContractAddress,
    getContract,
    gasEstimate,
  });

  const contract = await getContract({
    abi,
    contractAddress,
  });

  const args = [
    collateralTokenAddress,
    collateralAmount,
    collateralIdx,
  ];

  return transactionSender({
    contract,
    methodName: 'borrow',
    args,
    gas: gasEstimate,
    from,
    value,
    to: contractAddress,
  });
};

export const redeemDebtTokens = ({
  getContract,
  getAccount,
  transactionSender,
  call,
}) => async ({
  contractAddress,
  abi,
  tokensAmount,
  erc20Abi,
  debtTokenAddress,
}) => {
  const from = await getAccount();

  const gasEstimate = 800000;

  await depositErcHelper({
    isEthereumTransfer: false,
    erc20Abi,
    call,
    transactionSender,
    tokenAddress: debtTokenAddress,
    from,
    amount: tokensAmount,
    contractAddress,
    getContract,
    gasEstimate,
  });

  const contract = await getContract({
    abi,
    contractAddress,
  });

  return transactionSender({
    contract,
    methodName: 'redeemDebtTokens',
    args: [
      tokensAmount,
    ],
    gas: gasEstimate,
    from,
    to: contractAddress,
  });
};

export const redeemEquityTokens = ({
  getContract,
  getAccount,
  transactionSender,
  call,
}) => async ({
  contractAddress,
  abi,
  tokensAmount,
  erc20Abi,
  equityTokenAddress,
}) => {
  const from = await getAccount();

  const gasEstimate = 800000;

  await depositErcHelper({
    isEthereumTransfer: false,
    erc20Abi,
    call,
    transactionSender,
    tokenAddress: equityTokenAddress,
    from,
    amount: tokensAmount,
    contractAddress,
    getContract,
    gasEstimate,
  });

  const contract = await getContract({
    abi,
    contractAddress,
  });

  return transactionSender({
    contract,
    methodName: 'redeemEquityTokens',
    args: [
      tokensAmount,
    ],
    gas: gasEstimate,
    from,
    to: contractAddress,
  });
};

export const payBackLoans = ({
  getContract,
  getAccount,
  transactionSender,
  call,
}) => async ({
  contractAddress,
  abi,
  loanIdxes,
  paybackAmounts,
  loanToken,
  erc20Abi,
  isEthereumTransfer,
  tokenManagerContractAddress,
}) => {
  const from = await getAccount();

  const gasEstimate = 800000;

  const totalAmount = sumBigNumbers(paybackAmounts);

  await depositErcHelper({
    isEthereumTransfer,
    erc20Abi,
    call,
    transactionSender,
    tokenAddress: loanToken,
    from,
    amount: totalAmount,
    contractAddress: tokenManagerContractAddress,
    getContract,
    gasEstimate,
  });

  const contract = await getContract({
    abi,
    contractAddress,
  });

  return transactionSender({
    contract,
    methodName: 'payBackLoans',
    args: [loanIdxes, paybackAmounts],
    gas: gasEstimate,
    from,
    value: isEthereumTransfer ? totalAmount : '0',
    to: contractAddress,
  });
};

export const getLoanIdxes = ({
  call,
  getAccount,
  getContract,
}) => async ({
  contractAddress,
  abi,
}) => {
  const contract = await getContract({
    contractAddress,
    abi,
  });

  const beneficiary = await getAccount();

  const loanIdxes = await call({
    contract,
    methodName: 'getLoanIdxes',
    args: [beneficiary],
  });

  return loanIdxes;
};

const _bankPropertiesDynamicMap = {
  postSettleBalance: 1,
  isBankSettled: 2,
  debtCollected: 6,
  equityCollected: 7,
  totalBorrowed: 8,
};

const _bankPropertiesFullMap = {
  expirationDate: 4,
  debtInterest: 5,
  minimumReserveRatio: 3,
  lddInvestEquity: 10,
  lddInvestDebt: 11,
  lddBorrow: 12,
  ..._bankPropertiesDynamicMap,
};

const getBankStateDetailsPartial = async ({
  getContract,
  call,
  contractAddress,
  abi,
  bankPropertiesMap,
}) => {
  const contract = await getContract({
    contractAddress,
    abi,
  });

  const bankPropertiesObj = await Object.entries(
    bankPropertiesMap
  )
    .reduce(
      async (
        acc,
        [
          propName,
          propIdx,
        ]
      ) => {
        const newAcc = await acc;
        const bankProperty = await call({
          contract,
          methodName: 'getBankProperty',
          args: [ propIdx ],
        });
        return {
          ...newAcc,
          [propName]: bankProperty,
        };
      },
      Promise.resolve()
    );


  const constantVars = await [
    'RATE_PRECISION_MULTIPLIER',
    'BASE_MULTIPLIER',
    'MAX_LOANS',
    'MAX_LOANS_PER_BORROWER',
    'MACLAURIN_PRECISION',
  ].reduce(async (acc, methodName) => {
    const newAcc = await acc;
    const value = await call({
      contract,
      methodName,
      args: [],
    });
    return {
      ...newAcc,
      [methodName]: value,
    };
  }, {});

  const loanToken = await call({
    contract,
    methodName: 'getLoanToken',
    args: [],
  });
  bankPropertiesObj.loanToken = loanToken;
  const equityTokenP = call({
    contract,
    methodName: 'getToken',
    args: [true],
  });
  const debtTokenP = call({
    contract,
    methodName: 'getToken',
    args: [false],
  });
  const [
    equityToken,
    debtToken,
  ] = await Promise.all([
    equityTokenP,
    debtTokenP,
  ]);
  bankPropertiesObj.equityToken = equityToken;
  bankPropertiesObj.debtToken = debtToken;

  return {
    ...bankPropertiesObj,
    ...constantVars,
  };
};

/**
 * @param {HOCParams} hocParams
 *
 * @typedef {Object} Params
 * @property {string} erc20Abi
 * @property {Array<string>} contractAddresses
 *
 * @returns {(params : Params) => Promise<Array<string>>}
 */
export const getUserTokensBalance = ({
  getContract,
  getAccount,
  useMulticall,
  multicallConfig,
  getWeb3,
}) => async ({
  erc20Abi,
  contractAddresses,
}) => {
  const contracts = await Promise.all(contractAddresses.map(
    contractAddress => getContract({
      abi: erc20Abi,
      contractAddress,
    })
  ));
  const account = await getAccount();

  if (useMulticall) {
    const multicallPayload = await aggregate(
      contracts.map(contract => (
        {
          target: contract.address,
          call: ['balanceOf(address)(uint256)', account],
          returns: [[[contract.address.toLowerCase()], value => value.toString()]],
        }
      )),
      multicallConfig,
    );
    delete multicallPayload.results.blockNumber;

    return contractAddresses.map(contractAddress => multicallPayload.results[contractAddress]);
  }
  const web3 = await getWeb3();
  const requests = contracts.map(
    contract => createContractCallMethod(contract, 'balanceOf', account),
  );
  const { balances } = await executeBatch(web3, { balances: requests });
  return balances.map(etherBN => (etherBN ? etherBN.toString() : '0'));
};

export const getBankStateDetails = ({
  getContract,
  call,
}) => ({
  contractAddress,
  abi,
}) => getBankStateDetailsPartial({
  getContract,
  call,
  contractAddress,
  abi,
  bankPropertiesMap: _bankPropertiesFullMap,
});

export const deployBank = ({
  getAccount,
  getContract,
  transactionSender,
}) => async ({
  bankRegistryContract,
  commission,
  expirationDate,
  lddInvestEquity,
  lddInvestDebt,
  lddBorrow,
  minimumReserveRatio,
  loanAddress,
  debtInterest,
  amount,
  collateralMatrix,
  isEthereumLoan,
}) => {
  const contract = await getContract({
    abi: bankRegistryContract.abi,
    contractAddress: bankRegistryContract.contractAddress,
  });

  const from = await getAccount();
  const gasEstimate = 4500000;

  const txData = {
    contract,
    methodName: 'deployBank',
    args: [
      [
        expirationDate,
        lddInvestEquity,
        lddInvestDebt,
        lddBorrow,
      ],
      [
        minimumReserveRatio,
        commission,
        debtInterest,
        amount,
      ],
      loanAddress,
      ...collateralMatrix,
    ],
    gas: gasEstimate,
    gasSurplus: 500000,
    from,
    to: bankRegistryContract.contractAddress,
  };

  if (isEthereumLoan) {
    txData.value = new BigNumber(amount)
      .add(
        new BigNumber(commission)
      ).toString();
  }

  return transactionSender(txData);
};

export const getCollateralTokens = ({
  getContract,
  call,
}) => async ({
  contractAddress,
  abi,
}) => {
  const contract = await getContract({
    contractAddress,
    abi,
  });
  const tokensLength = await call({
    contract,
    methodName: 'getCollateralTokensLength',
    args: [],
  });

  const iterator = new Array(
    parseInt(
      tokensLength,
      10,
    )
  ).fill(0);
  return iterator.reduce(
    async (
      acc,
      _,
      idx
    ) => {
      const newAcc = await acc;
      const collateralTokenAddress = await call({
        contract,
        methodName: 'collateralTokens',
        args: [idx],
      });
      return newAcc.concat(collateralTokenAddress);
    },
    Promise.resolve([]),
  );
};

export const getMatrix = ({
  getContract,
  call,
}) => async ({
  contractAddress,
  abi,
  collateralTokens,
}) => {
  const contract = await getContract({
    contractAddress,
    abi,
  });
  return collateralTokens.reduce(
    async (
      tokensAcc,
      tokenAddress
    ) => {
      const newTokensAcc = await tokensAcc;
      const paramsLengthForToken = await call({
        contract,
        methodName: 'getLtvInterestLengthForToken',
        args: [tokenAddress],
      });
      const iterator = new Array(
        parseInt(
          paramsLengthForToken,
          10,
        )
      ).fill(0);
      const mappedTokenItems = await iterator.reduce(
        async (
          itemsAcc,
          _,
          idx
        ) => {
          const newItemsAcc = await itemsAcc;
          const ltvItemP = call({
            contract,
            methodName: 'ltvRates',
            args: [tokenAddress, idx],
          });
          const interestItemP = call({
            contract,
            methodName: 'interestRates',
            args: [tokenAddress, idx],
          });
          const [
            ltv,
            interest,
          ] = await Promise.all([
            ltvItemP,
            interestItemP,
          ]);
          return [
            ...newItemsAcc,
            {
              ltv,
              interest,
              key: idx,
            },
          ];
        },
        Promise.resolve([])
      );
      return [
        ...newTokensAcc,
        {
          tokenAddress,
          items: mappedTokenItems,
        },
      ];
    },
    Promise.resolve([])
  );
};

export const getBalance = ({
  getContract,
  call,
  getAccount,
}) => async ({
  contractAddress,
  abi,
  erc20Abi,
}) => {
  const contract = await getContract({
    contractAddress,
    abi,
  });

  const owner = await getAccount();

  const equityToken = await call({
    contract,
    methodName: 'getToken',
    args: [true],
  });

  const debtToken = await call({
    contract,
    methodName: 'getToken',
    args: [false],
  });

  const equityContract = await getContract({
    contractAddress: equityToken,
    abi: erc20Abi,
  });

  const debtContract = await getContract({
    contractAddress: debtToken,
    abi: erc20Abi,
  });

  const equityBalance = await call({
    contract: equityContract,
    methodName: 'balanceOf',
    args: [owner],
  });

  const debtBalance = await call({
    contract: debtContract,
    methodName: 'balanceOf',
    args: [owner],
  });

  return {
    equityBalance,
    debtBalance,
  };
};

/**
 *
 * @param {HOCParams} HocParams
 *
 * @typedef {string} Address
 * @typedef {Object} Params
 * @property {{ [bankAddr : string] : { equityToken : Address, debtToken : Address } }} equityDebtAddressByBankAddress
 * @property {boolean} useMulticall
 * @property {string} erc20Abi
 * @property {Object} multicallConfig
 * @returns {(params : Params) => Promise<{ [k : BankAddress] : { equityBalance : string, debtBalance : string } }>}
 */
export const getEquityDebtBalances = ({
  getAccount,
  getWeb3,
  useMulticall,
  getContract,
  multicallConfig,
}) => async ({
  equityDebtAddressByBankAddress,
  erc20Abi,
}) => {
  const account = await getAccount();
  const equityDebtAddressesEntries = Object.entries(equityDebtAddressByBankAddress);
  if (useMulticall) {
    const multicallPayload = await aggregate(
      Object.entries(equityDebtAddressByBankAddress)
        .reduce((reduced, [bankAddress, { equityToken, debtToken }]) => {
          reduced.push({
            target: equityToken,
            call: ['balanceOf(address)(uint256)', account],
            returns: [
              [[bankAddress, 'equityBalance'], value => value.toString()],
            ],
          });
          reduced.push({
            target: debtToken,
            call: ['balanceOf(address)(uint256)', account],
            returns: [
              [[bankAddress, 'debtBalance'], value => value.toString()],
            ],
          });
          return reduced;
        }, []),
      multicallConfig,
    );
    delete multicallPayload.results.blockNumber;
    return Object.entries(multicallPayload.results)
      .reduce((reduced, [addressAndField, value]) => {
        const [address, field] = addressAndField.split(',');
        reduced[address] = reduced[address] || {};
        reduced[address][field] = toBN(value);
        return reduced;
      }, {});
  }
  const web3 = await getWeb3();
  const equityTokenContracts = await Promise.all(
    equityDebtAddressesEntries.map(([, { equityToken }]) => getContract({
      contractAddress: equityToken, abi: erc20Abi,
    })),
  );
  const debtTokenContracts = await Promise.all(
    equityDebtAddressesEntries.map(([, { debtToken }]) => getContract({
      contractAddress: debtToken, abi: erc20Abi,
    })),
  );
  const equityBalancesMethods = equityTokenContracts.map(
    contract => createContractCallMethod(contract, 'balanceOf', account),
  );
  const debtBalancesMethods = debtTokenContracts.map(
    contract => createContractCallMethod(contract, 'balanceOf', account),
  );

  const {
    equityBalancesMethods: equityBalancesMethodsResults,
    debtBalancesMethods: debtBalancesMethodsResults,
  } = await executeBatch(web3, {
    equityBalancesMethods,
    debtBalancesMethods,
  });
  return equityDebtAddressesEntries.reduce((reduced, [bankAddress], index) => {
    reduced[bankAddress] = {
      equityBalance: toBN(equityBalancesMethodsResults[index]),
      debtBalance: toBN(debtBalancesMethodsResults[index]),
    };
    return reduced;
  }, {});
};

export const getContractVerified = genericEventFactory({
  eventPropName: 'contractVerifiedEventName',
  serializer: data => data,
});

export const getEquityTokensIssued = genericEventFactory({
  eventPropName: 'equityTokensIssuedEventName',
  serializer: ({
    beneficiary,
    amount,
    bank,
  }) => ({
    beneficiary,
    amount,
    bank,
  }),
});

export const getDebtTokensIssued = genericEventFactory({
  eventPropName: 'debtTokensIssuedEventName',
  serializer: ({
    beneficiary,
    amount,
    bank,
  }) => ({
    beneficiary,
    amount,
    bank,
  }),
});

export const getLoanPayback = genericEventFactory({
  eventPropName: 'loanPaybackEventName',
  serializer: ({
    borrower,
    amount,
    bank,
  }) => ({
    borrower,
    amount,
    bank,
  }),
});

export const getBorrowed = genericEventFactory({
  eventPropName: 'borrowedEventName',
  serializer: ({
    borrower,
    collateralType,
    collateralAmount,
    borrowedAmount,
    loanIdx,
    bank,
  }) => ({
    borrower,
    collateralType,
    collateralAmount,
    borrowedAmount,
    loanIdx,
    bank,
  }),
});

export const fetchBankAddresses = (api) => async ({
  abi,
  contractAddress,
  originBlock,
}) => {
  const events = await getContractVerified(api)({
    abi,
    contractAddress,
    originBlock,
  });
  return events.map(
    (
      {
        bank,
      },
    ) => bank
  );
};

export const getRepayAmount = ({
  getContract,
  call,
}) => async ({
  contractAddress,
  abi,
  loanIdx,
}) => {
  const contract = await getContract({
    contractAddress,
    abi,
  });

  const repayAmount = await call({
    contract,
    methodName: 'getRepayAmount',
    args: [loanIdx],
  });

  return repayAmount;
};

export const getOutstandingRepayAmount = ({
  getContract,
  call,
}) => async ({
  contractAddress,
  abi,
  loanIdx,
}) => {
  const contract = await getContract({
    contractAddress,
    abi,
  });

  const repayAmount = await call({
    contract,
    methodName: 'getOutstandingRepayAmount',
    args: [loanIdx],
  });

  return repayAmount;
};

export const getDebtRedeemed = genericEventFactory({
  eventPropName: 'debtRedeemedEventName',
  serializer: ({
    debtRedeemer,
    debtTokensRedeemed,
    payoutAmount,
    bank,
  }) => ({
    debtRedeemer,
    debtTokensRedeemed,
    payoutAmount,
    bank,
  }),
});

export const getEquityRedeemed = genericEventFactory({
  eventPropName: 'equityRedeemedEventName',
  serializer: ({
    equityRedeemer,
    equityTokensRedeemed,
    payoutAmount,
    bank,
  }) => ({
    equityRedeemer,
    equityTokensRedeemed,
    payoutAmount,
    bank,
  }),
});

export const getEventsForCurrentAddress = api => async ({
  eventEmitterContract,
}) => {
  const { getAccount } = api;
  const account = await getAccount();
  const tokenFilters = { beneficiary: account };
  const borrowerFilters = { borrower: account };
  const equityRedeemedFilters = { equityRedeemer: account };
  const debtRedeemerFilters = { debtRedeemer: account };

  const [
    getBorrowedWrapped,
    getLoanPaybackWrapped,
    getDebtTokensWrapped,
    getEquityTokensWrapped,
    getDebtRedeemedWrapped,
    getEquityRedeemedWrapped,
  ] = [
    getBorrowed,
    getLoanPayback,
    getDebtTokensIssued,
    getEquityTokensIssued,
    getDebtRedeemed,
    getEquityRedeemed,
  ].map(
    func => func(api)
  );

  const borrowedP = getBorrowedWrapped({
    ...eventEmitterContract,
    filters: borrowerFilters,
  });
  const loanPaybackP = getLoanPaybackWrapped({
    ...eventEmitterContract,
    filters: borrowerFilters,
  });
  const debtTokensP = getDebtTokensWrapped({
    ...eventEmitterContract,
    filters: tokenFilters,
  });
  const equityTokensP = getEquityTokensWrapped({
    ...eventEmitterContract,
    filters: tokenFilters,
  });
  const debtRedeemedP = getDebtRedeemedWrapped({
    ...eventEmitterContract,
    filters: debtRedeemerFilters,
  });
  const equityRedeemedP = getEquityRedeemedWrapped({
    ...eventEmitterContract,
    filters: equityRedeemedFilters,
  });
  const [
    borrowed,
    loanPayback,
    debtTokens,
    equityTokens,
    debtRedeemed,
    equityRedeemed,
  ] = await Promise.all([
    borrowedP,
    loanPaybackP,
    debtTokensP,
    equityTokensP,
    debtRedeemedP,
    equityRedeemedP,
  ]);
  return {
    borrowed,
    loanPayback,
    debtTokens,
    equityTokens,
    debtRedeemed,
    equityRedeemed,
  };
};

export const getCollateralEventsForBank = api => async ({
  eventEmitterContract,
  bankContractAddress,
}) => {
  const bankFilters = { bank: bankContractAddress };
  const getBorrowedWrrapped = getBorrowed(api);
  const getLoanPaybackWrapped = getLoanPayback(api);
  const borrowedP = getBorrowedWrrapped({
    ...eventEmitterContract,
    filters: bankFilters,
  });
  const loanPaybackP = getLoanPaybackWrapped({
    ...eventEmitterContract,
    filters: bankFilters,
  });
  const [
    borrowed,
    loanPayback,
  ] = await Promise.all([
    borrowedP,
    loanPaybackP,
  ]);
  return {
    borrowed,
    loanPayback,
  };
};

export const transfer = ({
  getContract,
  getAccount,
  transactionSender,
  call,
}) => async ({
  contractAddress,
  beneficiaryAddress,
  amount,
  erc20Abi,
  tokenAddress,
}) => {
  const from = await getAccount();

  const gasEstimate = 800000;

  const tokenContract = await getContract({
    abi: erc20Abi,
    contractAddress: tokenAddress,
  });

  if (await checkInvalidTokenBalance({
    tokenContract,
    from,
    call,
    amount,
  })) {
    throw new Error('Not enough funds');
  } else {
    const args = [
      beneficiaryAddress,
      amount,
    ];

    return transactionSender({
      contract: tokenContract,
      methodName: 'transfer',
      args,
      gas: gasEstimate,
      from,
      to: contractAddress,
    });
  }
};

export const fetchBankResolver = ({
  getContract,
  call,
}) => async ({
  contractAddress,
  abi,
}) => {
  const bankRegistry = await getContract({
    abi,
    contractAddress,
  });
  return call({
    contract: bankRegistry,
    methodName: 'resolver',
    args: [],
  });
};

export const getBankRegistryDetails = ({
  call,
  getContract,
}) => async ({
  contractAddress,
  abi,
}) => {
  const registryContract = await getContract({
    abi,
    contractAddress,
  });
  const minEquityP = call({
    methodName: 'minEquityBalance',
    contract: registryContract,
    args: [],
  });
  const commissionPercentageP = call({
    methodName: 'commissionPercentage',
    contract: registryContract,
    args: [],
  });
  const ratePrecisionP = call({
    methodName: 'RATE_PRECISION_MULTIPLIER',
    contract: registryContract,
    args: [],
  });
  const [
    minEquity,
    commissionPercentage,
    ratePrecision,
  ] = await Promise.all([
    minEquityP,
    commissionPercentageP,
    ratePrecisionP,
  ]);
  return {
    minEquity,
    commissionPercentage,
    ratePrecision,
  };
};

const approveTransactionFactory = amount => ({
  getAccount,
  getContract,
  transactionSender,
}) => async ({
  contractAddress,
  abi,
  tokenManagerAddress,
}) => {
  const from = await getAccount();
  const gasEstimate = 800000;
  const tokenContract = await getContract({
    abi,
    contractAddress,
  });

  return transactionSender({
    contract: tokenContract,
    methodName: 'approve',
    args: [tokenManagerAddress, amount],
    gas: gasEstimate,
    from,
    value: 0,
    to: contractAddress,
  });
};

export const approveTransaction = approveTransactionFactory(
  baseMultiplierBN
    .mul(new BigNumber('1000000'))
    .toString(),
);

export const disapproveTransaction = approveTransactionFactory('0');

/**
 * @param {HOCParams} HocParams
 *
 * @typedef {Object} Params
 * @property {string} erc20Abi
 * @property {Array<string>} contractAddresses
 * @property {string} spenderAddress
 *
 * @returns {(params : Params) => Promise<Array<string>>}
 */
export const getAllowance = ({
  getContract,
  getAccount,
  useMulticall,
  multicallConfig,
  getWeb3,
}) => async ({
  erc20Abi,
  contractAddresses,
  spenderAddress,
}) => {
  const contracts = await Promise.all(contractAddresses.map(
    contractAddress => getContract({
      abi: erc20Abi,
      contractAddress,
    })
  ));
  const owner = await getAccount();

  if (useMulticall) {
    const multicallPayload = await aggregate(
      contracts.map(contract => (
        {
          target: contract.address,
          call: ['allowance(address,address)(uint256)', owner, spenderAddress],
          returns: [[[contract.address.toLowerCase()], val => val.toString()]],
        }
      )),
      multicallConfig,
    );
    delete multicallPayload.results.blockNumber;

    return contractAddresses.map(contractAddress => multicallPayload.results[contractAddress]);
  }
  const requests = contracts.map(
    contract => createContractCallMethod(contract, 'allowance', owner, spenderAddress)
  );
  const web3 = await getWeb3();
  const { allowances } = await executeBatch(web3, { allowances: requests });
  return allowances.map(etherBN => (etherBN ? etherBN.toString() : '0'));
};

export const allEvents = genericEventFactory({
  eventPropName: 'allEventsName',
  serializer: data => data,
});

/**
 * @param {HOCParams} HOCParams
 *
 * @typedef {Object} Param
 * @property {string} bankAbi
 * @property {string} bankRegistryAbi
 * @property {Array<{ address : string, transactionHash : string }>} banksInfo
 *
 * @returns {(param : Param) => Promise<Array<{ bankContract : Object, matrix : Array }>>}
 */
export const getBanksStates = ({
  getWeb3,
  getContract,
}) => async ({
  bankAbi,
  bankRegistryAbi,
  banksInfo,
}) => {
  const web3 = await getWeb3();
  const bankContracts = await Promise.all(banksInfo.map(
    ({ address }) => getContract({ contractAddress: address, abi: bankAbi }),
  ));
  const getEquityTokenMethods = bankContracts.map(
    contract => createContractCallMethod(contract, 'getToken', true),
  );
  const getDebtTokensMethods = bankContracts.map(
    contract => createContractCallMethod(contract, 'getToken', false),
  );

  const getPostSettleBalanceMethods = bankContracts.map(
    contract => createContractCallMethod(
      contract,
      'getBankProperty',
      _bankPropertiesDynamicMap.postSettleBalance,
    ),
  );
  const getBankSettledMethods = bankContracts.map(
    contract => createContractCallMethod(
      contract,
      'getBankProperty',
      _bankPropertiesDynamicMap.isBankSettled,
    ),
  );
  const getDebtCollectedMethods = bankContracts.map(
    contract => createContractCallMethod(
      contract,
      'getBankProperty',
      _bankPropertiesDynamicMap.debtCollected,
    ),
  );
  const getEquityCollectedMethods = bankContracts.map(
    contract => createContractCallMethod(
      contract,
      'getBankProperty',
      _bankPropertiesDynamicMap.equityCollected,
    ),
  );
  const getTotalBorrowedMethods = bankContracts.map(
    contract => createContractCallMethod(
      contract,
      'getBankProperty',
      _bankPropertiesDynamicMap.totalBorrowed,
    ),
  );

  const getTransactionMethods = banksInfo.map(
    ({ transactionHash }) => web3.eth.getTransaction.request(transactionHash, noop),
  );

  const {
    getEquityTokenMethods: getEquityTokenResults,
    getDebtTokensMethods: getDebtTokensResults,
    getPostSettleBalanceMethods: getPostSettleBalanceResults,
    getBankSettledMethods: getBankSettledResults,
    getDebtCollectedMethods: getDebtCollectedResults,
    getEquityCollectedMethods: getEquityCollectedResults,
    getTotalBorrowedMethods: getTotalBorrowedResults,
    getTransactionMethods: getTransactionResults,
  } = await executeBatch(web3, {
    getEquityTokenMethods,
    getDebtTokensMethods,
    getPostSettleBalanceMethods,
    getBankSettledMethods,
    getDebtCollectedMethods,
    getEquityCollectedMethods,
    getTotalBorrowedMethods,
    getTransactionMethods,
  });

  const decodedResponse = banksInfo.reduce(
    (reduced, next, index) => {
      const equityToken = getEquityTokenResults[index];
      const debtToken = getDebtTokensResults[index];
      const postSettleBalance = getPostSettleBalanceResults[index];
      const bankSettled = getBankSettledResults[index];
      const debtCollected = getDebtCollectedResults[index];
      const equityCollected = getEquityCollectedResults[index];
      const totalBorrowed = getTotalBorrowedResults[index];
      /**
       * @type {Transaction}
       */
      const transaction = getTransactionResults[index];
      const { debtInterest, minimumReserveRatio, matrix, ...rest } = parseBankDeployTransactionPayload({
        payload: transaction.input,
        deployBankAbiItem: getBankDeployAbiItem(bankRegistryAbi),
      });
      reduced.push({
        bankContract: {
          ...rest,
          debtInterest: debtInterest.toString(),
          minimumReserveRatio: minimumReserveRatio.toString(),
          ...BankDeployConstantVars,
          postSettleBalance: toBN(postSettleBalance),
          bankSettled: Boolean(bankSettled.toNumber()),
          debtCollected: toBN(debtCollected),
          equityCollected: toBN(equityCollected),
          totalBorrowed: toBN(totalBorrowed),
          equityToken,
          debtToken,
          contractAddress: next.address,
        },
        matrix,
      });
      return reduced;
    }, []);
  return decodedResponse;
};
