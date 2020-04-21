//-----------------------------------------------------------------------------
// client/src/utils/transactions-helper.js
//-----------------------------------------------------------------------------

/**
 * Calculate the running balance for all of the transactions in the account
 * and return the updated array of transactions w/ the running balance for
 * each transaction.
 * 
 * NOTE: The calculation assumes the transactions are returned sorted by
 * descending date order.
 * 
 * @param   {Array} transactions
 * @returns Array of transactions w/ running balance for each transaction.
 */
export function runningBalance(transactions) {
  let rear                   = transactions.length - 1
  transactions[rear].balance = transactions[rear].amount

  for(let i = rear - 1; i >= 0; --i) {
    transactions[i].balance  = transactions[i+1].balance + transactions[i].amount
  }

  return transactions
}