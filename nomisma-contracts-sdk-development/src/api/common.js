import { BigNumber } from '../utils/bignumber';

export const checkInvalidTokenBalance = async ({
  tokenContract,
  amount,
  from,
  call,
}) => {
  const userBalance = await call({
    contract: tokenContract,
    methodName: 'balanceOf',
    args: [from],
  });
  return new BigNumber(userBalance).lt(
    new BigNumber(amount)
  );
};

/**
 * Use this function when the contract is receiving party. What it does is as
 * follows:
 *
 * 1. Checks that transferring user has enough balance (amount) to perform token
 * transfer.
 *
 * 2. If balance is sufficient it runs allowance to check for any existing
 * authorizations given from src to dest addresses for amount of tokens to be
 * able to transfer amount of tokens on behalf of src by dest.
 *
 * 3. If allowance does not exist or is smaller then amount it runs approve from
 * src to dest addresses for amount of tokens which serves as an authorization
 * for dest address to transfer amount of tokens on behalf of src.
 */
export const depositErcHelper = async ({
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
}) => {
  if (!isEthereumTransfer) {
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
      const currentAllowance = await call({
        contract: tokenContract,
        methodName: 'allowance',
        args: [from, contractAddress],
      });
      if (new BigNumber(currentAllowance).lt(new BigNumber(amount))) {
        await transactionSender({
          contract: tokenContract,
          methodName: 'approve',
          args: [contractAddress, amount],
          from,
          to: tokenAddress,
          gasEstimate,
        });
      }
    }
  }
};
