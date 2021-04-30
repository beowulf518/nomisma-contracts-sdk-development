import { orderPayloadMap } from '@nomisma/nomisma-smart-contract-helpers';

export const getSalt = ({
  getWeb3,
}) => async () => {
  const web3 = await getWeb3();
  return web3.utils.randomHex(32);
};

export const signPayload = ({
  getWeb3,
}) => async ({
  sigType = 'normal',
  ...orderPayload
}) => {
  const orderPayloadArr = orderPayloadMap.map(
    (
      {
        type,
        name,
      }
    ) => ({
      type,
      value: orderPayload[name],
    })
  );
  const web3 = await getWeb3();
  const hash = web3.utils.soliditySha3(...orderPayloadArr);
  let signature;
  if (sigType === 'normal') {
    signature = await web3.eth.sign(hash, orderPayload.userAddress);
  } else {
    const params = [hash, orderPayload.userAddress];
    const method = 'personal_sign';
    const result = await web3.currentProvider.sendPayload({
      method,
      params,
      from: orderPayload.userAddress,
    });
    signature = result.result;
  }
  return {
    order: orderPayload,
    hash,
    signature,
  };
};
