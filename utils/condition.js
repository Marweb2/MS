/** @format */

const condition = (uid, receiver) => {
  return [
    {
      $and: [{ client: uid }, { assistant: receiver }],
    },
    {
      $and: [{ client: receiver }, { assistant: uid }],
    },
  ];
};
module.exports = { condition };
