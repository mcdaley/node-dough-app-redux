//-----------------------------------------------------------------------------
// client/src/pages/accounts/Show.js
//-----------------------------------------------------------------------------
import React, { useState, useEffect }   from 'react'
import { 
  Container, 
  Row,
  Col,
  Button, 
}                                       from 'react-bootstrap'
import { useParams, useHistory }        from 'react-router-dom'

import TransactionsAPI                  from '../../api/transactions-api'
import AccountSummary                   from '../../components/account/Summary'
import TransactionGrid                  from '../../components/transaction/Grid'
import TransactionForm                  from '../../components/transaction/Form'
import { runningBalance }               from '../../utils/transactions-helper'

/**
 * 
 */
const PagesAccountsShow = () => {
  let history = useHistory()        // Link to navigate to previous screen

  // Get accountId, so it can be as the useEffect() dependency
  let   { id }                    = useParams()   // Get accountId from the URL
  const [accountId, setAccountId] = useState(id)

  // Get the account and its transactions
  const [account, setAccount]           = useState({})
  const [transactions, setTransactions] = useState([])
  useEffect( () => {
    const fetchData = async () => {
      try {
        let result = await TransactionsAPI.findByAccountId(accountId)

        //* console.log(`[debug] TransactionsAPI.findByAccountId(${accountId})= `, result)
        setAccount(result.account)
        setTransactions(result.transactions)
      }
      catch(error) {
        console.log(`[error] Failed to retrieve account transactions, error= `, error)
        setErrors(error)
      }
    }

    fetchData()
  }, [accountId])

  // Handle create account errors
  const [errors, setErrors] = useState({})

  /**
   * Navigate back to the previous screen.
   */
  const handleClick = () => history.goBack()

  /**
   * Callback to handle the creation of a new transaction. It updates
   * the transactions array w/ the new transaction to re-render the
   * transaction data grid.
   * 
   * @param {Object} transaction - Transaction that was just created in DB
   */
  const onCreateTransaction = ({transaction}) => {
    //* console.debug(`[debug] Created transaction= `, transaction)

    let transactionList = buildTransactionList(transaction)
    setTransactions(transactionList)
  }

  /**
   * Sort the transactions and calculate the running balance for the account.
   * @param {*} transaction - Transaction that was just created.
   */
  const buildTransactionList = (transaction) => {
    let txnList = [...transactions, transaction].sort( (a,b) => {
      return new Date(b.date) - new Date(a.date)
    })

    txnList = runningBalance(txnList)

    return txnList
  }

  /////////////////////////////////////////////////////////////////////////////
  // TODO: 04/15/2020
  //  - STANDARDIZE ON THE TransactionsAPI RESPONSES. THE create() METHOD
  //    RETURNS AN OBJECT { transaction: {} } AND THE update() METHOD RETURNS
  //    THE DATA {}.
  //  - 04/18/20 => SHOULD MOVE TO RETURNING AN OBJECT {} AS THAT GIVES 
  //    MORE FLEXIBILITY IN THE FUTURE. NEED TO UPDATE THE
  //    TransactionsAPI.update() to return {transaction}
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Callback to handle a transaction update. It finds and replaces the updated
   * transaction in the transactions list to re-render the transaction list.
   * 
   * @param {Object} transaction 
   */
  const onUpdateTransaction = async (accountId, transactionId, params) => {
    console.debug(`[debug] Update transaction id[${transactionId}]= `, params)

    try {
      let transaction         = await TransactionsAPI.update(accountId, transactionId, params)

      let transactionList     = [...transactions]
      let index               = transactionList.findIndex( (el) => el._id === transaction._id)
      transactionList[index]  = transaction
      transactionList.sort( (a, b) => new Date(b.date) - new Date(a.date) )
      transactionList         = runningBalance(transactionList)
    
      setTransactions(transactionList)
    }
    catch(error) {
      console.log(`[error] Failed to update the transaction, error= `, error)
      setErrors(error)
    }
  }

  /**
   * Render the account summary.
   */
  const renderAccountSummary = () => {
    if(Object.keys(account).length === 0 || account == null) return null
    
    return (
      <AccountSummary
        _id                 = {account._id}
        name                = {account.name}
        financialInstitute  = {account.financialInstitute}
        balance             = {account.balance}
      />
    )
  }

  /**
   * Render the form to create new account transactions.
   */
  const renderTransactionForm = () => {
    if(Object.keys(account).length === 0 || account == null) return null

    return (
      <TransactionForm
        accountId = {account._id}
        onSubmit  = {onCreateTransaction}
      />
    )
  }

  /**
   * Render the transactions grid
   */
  const renderTransactions = () => {
    if(transactions.length === 0) return null

    return (
      <TransactionGrid 
        transactions  = {transactions} 
        onUpdate      = {onUpdateTransaction}
      />
    )
  }

  /**
   * Render the PagesAccountsShow screen
   */
  return (
    <Container fluid>      
      <Row>
        <Col>
          {renderAccountSummary()}
        </Col>
      </Row>
      <Row>
        <Col>
          {renderTransactionForm()}
        </Col>
      </Row>
      <Row>
        <Col>
          {renderTransactions()}
        </Col>
      </Row>
      <Button variant='primary' onClick={handleClick}>
        Go Back
      </Button>
    </Container>
  )
}

// Export the account details page
export default PagesAccountsShow