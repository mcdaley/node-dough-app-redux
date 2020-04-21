//-----------------------------------------------------------------------------
// client/src/__mocks__/axios.js
//-----------------------------------------------------------------------------
export default {
  get:  jest.fn().mockResolvedValue({ data: {} }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  put:  jest.fn().mockResolvedValue({ data: {} })
};