
export const generateOpmBidId = ({
  sender,
  bidIdx,
}) => `${sender}-${bidIdx}`;

export const parseBidId = bidId => {
  const [sender, bidIdx ] = bidId.split('-');
  return {
    sender,
    bidIdx,
  };
};
