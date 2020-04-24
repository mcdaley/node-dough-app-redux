//-----------------------------------------------------------------------------
// client/src/ducks/__tests__/accounts/actions.test.js
//-----------------------------------------------------------------------------
import { actions, types }   from '../../accounts'

import accountsApiMock      from '../../../api/accounts-api'
jest.mock('../../../api/accounts-api')

// Mock account data
const accountsData = {
  '1': { 
    _id:                '1', 
    name:               'Test Checking Account', 
    financialInstitute: 'Bank', 
    type:               'Checking', 
    balance:            100.00,
    initialDate:        '2020-03-31T07:00:00.000Z',
    userId:             'Me'
  },
  '2': { 
    _id:                '2', 
    name:               'Test Credit Card', 
    financialInstitute: 'Credit Union', 
    type:               'Credit Card', 
    balance:            500.00,
    initialDate:        '2020-03-31T07:00:00.000Z',
    userId:             'Me',
  }
}

/**
 * Accounts Redux Actions
 */
describe('Account Redux Actions', () => {
  //
  // TEST actions.fetchAccounts()
  //
  describe('fetchAccounts()', () => { 
    it('Dispatches FETCH_ACCOUNTS', async () => {
      const dispatch = jest.fn()
      
      // Mock AccountsAPI.get()
      accountsApiMock.get.mockResolvedValueOnce(accountsData)

      await actions.fetchAccounts()(dispatch)
      
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenLastCalledWith({
        type:     types.FETCH_ACCOUNTS,
        payload:  {accounts: accountsData}
      })
    })
    
    it('Dispatches FETCH_ACCOUNTS_ERROR', async () => {
      const dispatch = jest.fn()
      
      // Mock AccountsAPI.get()
      const error = {code: 500, message: 'Server error'}
      accountsApiMock.get.mockRejectedValueOnce(error)

      await actions.fetchAccounts()(dispatch)
      
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenLastCalledWith({
        type:     types.FETCH_ACCOUNTS_ERROR,
        payload:  {error: error},
      })
    }) 
  })
  //
  // TEST actions.findAccount()
  //
  describe('findAccount', () => {
    it('Dispatches FIND_ACCOUNT', async () => {
      const dispatch = jest.fn()

      // Mock AccountsAPI.find(accountId)
      accountsApiMock.find.mockResolvedValueOnce(accountsData['2'])

      await actions.findAccount('2')(dispatch)

      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenLastCalledWith({
        type:     types.FIND_ACCOUNT,
        payload:  {account: accountsData['2']}
      })
    })

    it('Dispatches FIND_ACCOUNT_ERROR', async () => {
      const dispatch = jest.fn()
      
      // Mock AccountsAPI.find()
      const error = {code: 500, message: 'Server error'}
      accountsApiMock.find.mockRejectedValueOnce(error)

      await actions.findAccount()(dispatch)
      
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenLastCalledWith({
        type:     types.FIND_ACCOUNT_ERROR,
        payload:  {error: error},
      })
    })
  })
  //
  // TEST: actions.createAccount()
  //
  describe('createAccount()', () => {
    it('Dispatches CREATE_ACCOUNT', async () => {
      const dispatch = jest.fn()
      const account  = {
        _id:                '999',      // Must be unique since used as key.
        name:               'Test Credit Card', 
        financialInstitute: 'Credit Union', 
        type:               'Credit Card', 
        balance:            500.00,
        initialDate:        '2020-03-31T07:00:00.000Z',
      }
      accountsApiMock.create.mockResolvedValueOnce(account)

      await actions.createAccount({})(dispatch)

      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenLastCalledWith({
        type:     types.CREATE_ACCOUNT,
        payload:  {account: account}
      })
    })
  })

  it('Dispatches CREATE_ACCOUNT_ERROR', async () => {
    const dispatch  = jest.fn()
    const error     = {code: 400, message: 'Bad request'}
    accountsApiMock.create.mockRejectedValueOnce(error)

    await actions.createAccount({})(dispatch)

    expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenLastCalledWith({
        type:     types.CREATE_ACCOUNT_ERROR,
        payload:  {error: error},
      })
  })
})