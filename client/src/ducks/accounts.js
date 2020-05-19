//-----------------------------------------------------------------------------
// client/src/ducks/accounts.js
//-----------------------------------------------------------------------------
import { combineReducers }            from 'redux'

import AccountsAPI                    from '../api/accounts-api'
import { types as transactionTypes }  from './transactions'
import { types as userTypes }         from './users'

//
// Account Action Types
//
export const types = {
  FETCH_ACCOUNTS:                   'FETCH_ACCOUNTS',
  FETCH_ACCOUNTS_ERROR:             'FETCH_ACCOUNTS_ERROR',
  FIND_ACCOUNT:                     'FIND_ACCOUNT',
  FIND_ACCOUNT_ERROR:               'FIND_ACCOUNT_ERROR',
  CREATE_ACCOUNT:                   'CREATE_ACCOUNT',
  CREATE_ACCOUNT_ERROR:             'CREATE_ACCOUNT_ERROR',
  CREATE_TRANSACTION:               transactionTypes.CREATE_TRANSACTION,
  UPDATE_TRANSACTION:               transactionTypes.UPDATE_TRANSACTION,
  FETCH_TRANSACTIONS_BY_ACCOUNT_ID: transactionTypes.FETCH_TRANSACTIONS_BY_ACCOUNT_ID,
  USER_LOGIN:                       userTypes.USER_LOGIN,
  USER_LOGOUT:                      userTypes.USER_LOGOUT,
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

//
// Account Reducer
//
let   initialState   = {}
const accountsById  = (state = initialState, action) => {
  switch(action.type) {
    case types.FETCH_ACCOUNTS:
      return {
        ...state,
        ...action.payload.accounts,
      }
    case types.FETCH_ACCOUNTS_ERROR:
      return {
        ...state,
        error: action.payload.error
      }
    case types.FIND_ACCOUNT:
      return {
        ...state,
        [action.payload.account._id]: action.payload.account,
      }
      case types.FIND_ACCOUNT_ERROR:
        return {
          ...state,
          error: action.payload.error
        }
    case types.CREATE_ACCOUNT:
      return {
        ...state,
        [action.payload.account._id]: action.payload.account,
      }
    case types.CREATE_ACCOUNT_ERROR:
      return {
        ...state,
        error: action.payload.error
      }
    case types.CREATE_TRANSACTION:
      let account     = action.payload.account
      let transaction = action.payload.transaction
      return {
        ...state,
        [account._id]: {
          ...account,
          transactions: [...state[account._id].transactions, transaction._id]
        }
      }
    case types.UPDATE_TRANSACTION:
      const accountId = action.payload.account._id
    
      return {
        ...state,
        [action.payload.account._id]: {
          ...state[accountId],                // Need to keep transactions []
          ...action.payload.account,
        }
      }
    case types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID:
      return {
        ...state,
        [action.payload.account._id]: {
          ...action.payload.account,
          transactions: Object.keys(action.payload.transactions)
        }
      }
    case types.USER_LOGIN: 
      return {
        ...initialState,    // Reset state when user logs into the app.
      }
    case types.USER_LOGOUT: 
      return {
        ...initialState,    // Reset state when user logs out of the app.
      }
    default:
      return state
  }
}

//
// Export the reducer
//
export const reducer = combineReducers({
  byId:   accountsById,
})

