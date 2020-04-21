//-----------------------------------------------------------------------------
// client/src/__mocks__/transactions-api.js
//-----------------------------------------------------------------------------
export default {
  findByAccountId:  jest.fn().mockResolvedValue([]),
  create:           jest.fn().mockResolvedValue({}),
  update:           jest.fn().mockResolvedValue({})
};