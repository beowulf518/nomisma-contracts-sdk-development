export const getFullTree = ({
  getContract,
  call,
}) => async ({
  contractAddress,
  abi,
}) => {
  const strikeValidator = await getContract({
    abi,
    contractAddress,
  });

  const strikeValidatorState = await call({
    contract: strikeValidator,
    methodName: 'getFullTree',
    args: [],
  });


  strikeValidatorState.priceSteps = strikeValidatorState.priceSteps.map(priceStep =>{
    // In strike validator we use red-black tree for storing intervals
    // To safe space we use first bit from the left of priceStep to represent if node is red or black
    // If it is red we XOR priceStep value with (1 << 127)
    // That is why priceStep values from getFullTree has incorrect values for red nodes
    // This is only temporary fix, this logic should be moved to StrikePriceValidator contract
    const isRedNode = BigInt(priceStep) >> BigInt(127) & BigInt(1);

    return isRedNode ? (BigInt(priceStep) ^ BigInt(1) << BigInt(127)).toString() : priceStep;
  });

  return strikeValidatorState;
};
