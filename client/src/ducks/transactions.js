//-----------------------------------------------------------------------------
// client/src/ducks/transactions.js
//-----------------------------------------------------------------------------
import { combineReducers }        from 'redux'

import TransactionsAPI            from '../api/transactions-api'
import AccountsAPI                from '../api/accounts-api'
import { types as userTypes }     from './users'

//
// Transactions Action Types
//
export const types = {
  FETCH_TRANSACTIONS_BY_ACCOUNT_ID:         'FETCH_TRANSACTIONS_BY_ACCOUNT_ID',
  FETCH_TRANSACTIONS_BY_ACCOUNT_ID_ERROR:   'FETCH_TRANSACTIONS_BY_ACCOUNT_ID_ERROR',
  CREATE_TRANSACTION:                       'CREATE_TRANSACTION',
  CREATE_TRANSACTION_ERROR:                 'CREATE_TRANSACTION_ERROR',
  UPDATE_TRANSACTION:                       'UPDATE_TRANSACTION',
  UPDATE_TRANSACTION_ERROR:                 'UPDATE_TRANSACTION_ERROR',
  USER_LOGIN:                               userTypes.USER_LOGIN,
  USER_LOGOUT:                              userTypes.USER_LOGOUT,
}

//
// Transactions Actions
//
export const actions = {
  /**
   * Returns all of the transactions for an account.
   * @param {String} accountId 
   */
  fetchTransactionsByAccountId(accountId) {
    return async function(dispatch, getState) {
      try {
        let {transactions} = await TransactionsAPI.findByAccountId(accountId)
        let account        = await AccountsAPI.find(accountId)

        //** console.log(`[debug] TransactionsAPI.findByAccountId()= `, transactions)
        dispatch({
          type:     types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID,
          payload:  {
            transactions: transactions,
            account:      account
          }
        })
      }
      catch(error) {
        //* console.log(`[error] Failed to retrieve account transactions, error= `, error)
        dispatch({
          type:     types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID_ERROR,
          payload:  {error: error}
        })
      }
    }
  },
  /**
   * Create a new transaction for an account.
   * @param {String} accountId 
   * @param {Object} transaction 
   */
  createTransaction(accountId, transactionParams) {
    return async function(dispatch, getState) {
      try {
        const {transaction, account} = await TransactionsAPI.create(accountId, transactionParams)

        //* console.log(`[info] Created transaction: ${JSON.stringify(transaction, undefined, 2)}`)
        //* console.log(`[info] Updated account: ${JSON.stringify(account, undefined, 2)}`)
        dispatch({
          type:     types.CREATE_TRANSACTION,
          payload:  {
            transaction:  transaction,
            account:      account,
          }
        })
      }
      catch(error) {
        console.log(`[error] Failed to create transaction, error= `, error)
        dispatch({
          type:     types.CREATE_TRANSACTION_ERROR,
          payload:  {error: error}
        })
      }
    }
  },
  /**
   * Update an account's transactions.
   * @param {String} accountId     - Unique account id
   * @param {String} transactionId - Unique transaction id
   * @param {Object} params        - name/value pairs of transaction fields to update
   */
  updateTransaction(accountId, transactionId, params) {
    return async function(dispatch, getState) {
      try {
        let {transaction, account} = await TransactionsAPI.update(accountId, transactionId, params)
  
        //* console.log(`[debug] Updated transacton= `, transaction)
        dispatch({
          type:     types.UPDATE_TRANSACTION,
          payload:  {
            transaction:  transaction,
            account:      account,
          }
        })
      }
      catch(error) {
        //* console.log(`[error] Failed to update the transaction, error= `, error)
        dispatch({
          type:     types.CREATE_TRANSACTION_ERROR,
          payload:  {error: error}
        })
      }
    }
  }
}

//
// Transactions Reducer
//
let   initialState = {}
const transactionsById = (state = initialState, action) => {
  switch(action.type) {
    case types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID:
      return {
        ...state,
        ...action.payload.transactions,
      }
    case types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID_ERROR:
      return {
        ...state,
        error: action.payload.error
      }
    case types.CREATE_TRANSACTION:
      return {
        ...state,
        [action.payload.transaction._id]: action.payload.transaction,
      }
    case types.CREATE_TRANSACTION_ERROR:
      return {
        ...state,
        error: action.payload.error
      }
    case types.UPDATE_TRANSACTION:
      return {
        ...state,
        [action.payload.transaction._id]: action.payload.transaction,
      }
    case types.UPDATE_TRANSACTION_ERROR:
      return {
        ...state,
        error: action.payload.error
      }
    case types.USER_LOGIN:
      return {
        ...initialState,
      }
    case types.USER_LOGOUT: 
      return {
        ...initialState, 
      }
    default:
      return state
  }
}

//
// Export the reducer
//
export const reducer = combineReducers({
  byId:   transactionsById,
})