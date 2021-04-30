
export const longCallOptionType = 0;
export const shortPutOptionType = 1;

export const optionTypeToName = {
  [longCallOptionType]: 'Long Call',
  [shortPutOptionType]: 'Short Put',
};

export const compatibleOptionTypes = {
  [longCallOptionType]: shortPutOptionType,
  [shortPutOptionType]: longCallOptionType,
};
