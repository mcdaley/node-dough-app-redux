//-----------------------------------------------------------------------------
// client/src/__mocks__/auth-api.js
//-----------------------------------------------------------------------------
export default {
  register: jest.fn().mockResolvedValue([]),
  login:    jest.fn().mockResolvedValue([]),
};