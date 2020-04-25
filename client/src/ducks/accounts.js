//-----------------------------------------------------------------------------
// client/src/ducks/accounts.js
//-----------------------------------------------------------------------------
import AccountsAPI                from '../api/accounts-api'

//
// Account Action Types
//
export const types = {
  FETCH_ACCOUNTS:           'FETCH_ACCOUNTS',
  FETCH_ACCOUNTS_ERROR:     'FETCH_ACCOUNTS_ERROR',
  FIND_ACCOUNT:             'FIND_ACCOUNT',
  FIND_ACCOUNT_ERROR:       'FIND_ACCOUNT_ERROR',
  CREATE_ACCOUNT:           'CREATE_ACCOUNT',
  CREATE_ACCOUNT_ERROR:     'CREATE_ACCOUNT_ERROR',
}

//
// Account Actions
//
export const actions = {
  /**
   * Retrieve all of a user's accounts
   */
  fetchAccounts() {
    return async function(dispatch, getState) {
      try {
        let accounts = await AccountsAPI.get()
        
        //* console.log(`[debug] AccountsAPI.get(), accounts = `, accounts)
        dispatch({
          type:     types.FETCH_ACCOUNTS,
          payload:  {accounts: accounts}
        })
      } 
      catch (error) {
        //* console.log(`[error] Failed to retrieve user accounts, error= `, error)
        dispatch({
          type:     types.FETCH_ACCOUNTS_ERROR,
          payload:  {error: error}
        })
      }
    }
  },
  findAccount(accountId) {
    return async function(dispatch, getState) {
      try {
        let account = await AccountsAPI.find(accountId)

        //* console.log(`[debug] AccountsAPI.find(${accountId}), account= `, account)
        dispatch({
          type:     types.FIND_ACCOUNT,
          payload:  {account: account}
        })
      }
      catch(error) {
        //* console.log(`[error] Failed to find account id=[${accountId}], error= `, error)
        dispatch({
          type:     types.FIND_ACCOUNT_ERROR,
          payload:  {error: error}
        })
      }
    }
  },
  /**
   * 
   * @param {*} account 
   */
  createAccount(account) {
    return async function(dispatch, getState) {
      try {
        let result = await AccountsAPI.create(account)

        //* console.log(`[debug] AccountsAPI.create(), accounts = `, result)
        dispatch({
          type:     types.CREATE_ACCOUNT,
          payload:  {account: result}
        })
      }
      catch(error) {
        //* console.log(`[error] Failed to create new account, error= `, error)
        dispatch({
          type:     types.CREATE_ACCOUNT_ERROR,
          payload:  {error: error}
        })
      }
    }
  }
}
///////////////////////////////////////////////////////////////////////////////
// BUG: 04/23/2020
// The errors are not being added to the store under an "errors" field. The
// code and message are just added to the store as fields.
//
// SOLUTION:
// Need to define the following for initialState = { data: {}, error: {}}
///////////////////////////////////////////////////////////////////////////////

//
// Account Reducer
//
let    accountId
let    initialState   = {data: {}, error: {}}
export const reducer  = (state = initialState, action) => {
  switch(action.type) {
    case types.FETCH_ACCOUNTS:
      return {
        ...state,
        data: {
          ...state.data,
          ...action.payload.accounts
        },
      }
    case types.FETCH_ACCOUNTS_ERROR:
      return {
        ...state,
        error: action.payload.error
      }
    case types.FIND_ACCOUNT:
      accountId = action.payload.account._id
      return {
        ...state,
        data: {
          ...state.data,
          [accountId]: action.payload.account
        }
      }
      case types.FIND_ACCOUNT_ERROR:
        return {
          ...state,
          error: action.payload.error
        }
    case types.CREATE_ACCOUNT:
      accountId = action.payload.account._id
      return {
        ...state,
        data: {
          ...state.data,
          [accountId]: action.payload.account,}
      }
    case types.CREATE_ACCOUNT_ERROR:
      return {
        ...state,
        error: action.payload.error
      }
    default:
      return state
  }
}

