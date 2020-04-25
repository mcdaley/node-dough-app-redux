//-----------------------------------------------------------------------------
// client/src/ducks/transactions.js
//-----------------------------------------------------------------------------
import TransactionsAPI            from '../api/transactions-api'

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

        //** console.log(`[debug] TransactionsAPI.findByAccountId()= `, transactions)
        dispatch({
          type:     types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID,
          payload:  {transactions: transactions}
        })
      }
      catch(error) {
        console.log(`[error] Failed to retrieve account transactions, error= `, error)
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
  createTransaction(accountId, transaction) {
    return async function(dispatch, getState) {
      try {
        let result = await TransactionsAPI.create(accountId, transaction)

        //* console.log(`[info] Created transaction: ${JSON.stringify(result, undefined, 2)}`)
        dispatch({
          type:     types.CREATE_TRANSACTION,
          payload:  {
            transaction: result.transaction
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
        let transaction = await TransactionsAPI.update(accountId, transactionId, params)
  
        console.log(`[debug] Updated transacton= `, transaction)
        dispatch({
          type:     types.UPDATE_TRANSACTION,
          payload:  {transaction: transaction}
        })
      }
      catch(error) {
        console.log(`[error] Failed to update the transaction, error= `, error)
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
let    initialState  = {data: {}, error: {}}
export const reducer = (state = initialState, action) => {
  switch(action.type) {
    case types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID:
      return {
        ...state,
        data: {...action.payload.transactions}
      }
    case types.FETCH_TRANSACTIONS_BY_ACCOUNT_ID_ERROR:
      return {
        ...state,
        error: action.payload.error
      }
    case types.CREATE_TRANSACTION:
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.transaction._id]: action.payload.transaction
        }
      }
    case types.CREATE_TRANSACTION_ERROR:
      return {
        ...state,
        error: action.payload.error
      }
    case types.UPDATE_TRANSACTION:
      return {
        ...state,
        data: {
          ...state.data,
          [action.payload.transaction._id]: action.payload.transaction
        }
      }
    case types.UPDATE_TRANSACTION_ERROR:
      return {
        ...state,
        error: action.payload.error
      }
    default:
      return state
  }
}
