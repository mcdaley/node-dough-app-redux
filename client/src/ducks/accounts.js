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
        
        console.log(`[debug] AccountsAPI.get(), accounts = `, accounts)
        dispatch({
          type:     types.FETCH_ACCOUNTS,
          payload:  accounts
        })
      } 
      catch (error) {
        console.log(`[error] Failed to retrieve user accounts, error= `, error)
        dispatch({
          type:     types.FETCH_ACCOUNTS_ERROR,
          payload:  error
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
        let response = await AccountsAPI.create(account)

        //* console.log(`[debug] AccountsAPI.create(), accounts = `, response)
        dispatch({
          type:     types.CREATE_ACCOUNT,
          payload:  response
        })
      }
      catch(error) {
        console.log(`[error] Failed to create new account, error= `, error)
        dispatch({
          type:     types.CREATE_ACCOUNT_ERROR,
          payload:  error
        })
      }
    }
  }
}

//
// Account Reducer
//
let    initialState   = []
export const reducer  = (state = initialState, action) => {
  switch(action.type) {
    case types.FETCH_ACCOUNTS:
      return {
        ...state,
        data: [...action.payload]
      }
    case types.FETCH_ACCOUNTS_ERROR:
      return {
        ...state,
        ...action.payload.error
      }
    case types.CREATE_ACCOUNT:
      return {
        ...state,
        data: [...state.data, action.payload],
      }
    case types.CREATE_ACCOUNT_ERROR:
      return {
        ...state,
        ...action.payload.error
      }
    default:
      return state
  }
}

