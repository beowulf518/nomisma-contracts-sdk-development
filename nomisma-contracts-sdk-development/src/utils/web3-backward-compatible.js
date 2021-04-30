const isEtherBigNumber = value => {
  return typeof value !== 'undefined' && value.hasOwnProperty('_ethersType') && value._ethersType === 'BigNumber';
};

export const convertBigNumberToString = (
  value,
  isBN,
) => {
  let toReturn;
  if (!!value && typeof value === 'object') {
    if (isBN(value) || isEtherBigNumber(value)) {
      toReturn = value.toString();
    } else if (Array.isArray(value)) {
      toReturn = value.map(arrElement => convertBigNumberToString(arrElement, isBN));
    } else if (Object.keys(value).length > 0) {
      Object.keys(value).forEach(key => {
        value[key] = convertBigNumberToString(value[key], isBN);
      });
      toReturn = value;
    } else if (!!value && !!value.toString && typeof value.toString === 'function') {
      toReturn = value.toString();
    } else {
      throw new Error(`Unknown value type ${value} to parse. Bailing.`);
    }
  } else {
    toReturn = value;
  }

  return toReturn;
};
