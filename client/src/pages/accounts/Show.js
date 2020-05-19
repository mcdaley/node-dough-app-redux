//-----------------------------------------------------------------------------
// client/src/pages/accounts/Show.js
//-----------------------------------------------------------------------------
import React, { useState, useEffect }   from 'react'
import { useSelector, useDispatch }     from 'react-redux'
import { 
  Alert,
  Button,
  Col,
  Container, 
  Row,
}                                       from 'react-bootstrap'
import { useParams, useHistory }        from 'react-router-dom'

import AccountSummary                   from '../../components/account/Summary'
import TransactionGrid                  from '../../components/transaction/Grid'
import TransactionForm                  from '../../components/transaction/Form'
import { runningBalance }               from '../../utils/transactions-helper'
import { actions }                      from '../../ducks/transactions'

/**
 * 
 */
const PagesAccountsShow = () => {
  let   history                   = useHistory()  // Link to navigate to previous screen

  let   { id }                    = useParams()   // Get accountId from the URL
  const [accountId, setAccountId] = useState(id)

  const dispatch     = useDispatch()
  const accounts     = useSelector(state => state.accounts.byId)
  const transactions = useSelector(state => state.transactions.byId)
  const error        = useSelector(state => state.transactions.byId.error)
 
  /**
   * Fetch Account and Transactions when the page loads.
   */
  useEffect( () => {
    const fetchData = () => {
      dispatch(actions.fetchTransactionsByAccountId(accountId))
    }

    // Fetch transactions if they aren't in redux store.
    if(!accounts[accountId] || !accounts[accountId].transactions) {
      fetchData()
    }
  }, [accountId])

  /**
   * Navigate back to the previous screen.
   */
  const handleClick = () => history.goBack()

  /**
   * Callback to handle the creation of a new transaction. It creates a 
   * new transaction and it updates the account balance. Next, it updates
   * the transactions and accounts redux stores w/ the new data so the
   * screen is re-rendered w/ the new transaction and the updated balance
   * 
   * @param {String} accountId   - Account the transaction belongs-to.
   * @param {Object} transaction - Parameters for creating the transaction
   */
  const onCreateTransaction = (accountId, transaction) => {
    //* console.log(`[debug] Created transaction= `, transaction)
    dispatch(actions.createTransaction(accountId, transaction))
  }

  /**
   * Callback to handle a transaction update. It finds and replaces the updated
   * transaction in the transactions list to re-render the transaction list.
   * 
   * @param {Object} transaction 
   */
  const onUpdateTransaction = async (accountId, transactionId, params) => {
    //* console.debug(`[debug] Update transaction id[${transactionId}]= `, params)
    dispatch(actions.updateTransaction(accountId, transactionId, params))
  }

  /**
   * Render the account summary.
   */
  const renderAccountSummary = () => {
    if(Object.keys(accounts).length === 0 || accounts == null) return null
    
    const account = accounts[accountId]
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
   * Render the form to create a new account transaction.
   */
  const renderTransactionForm = () => {
    if(Object.keys(accounts).length === 0 || accounts == null) return null

    return (
      <TransactionForm
        accountId = {accountId}
        onSubmit  = {onCreateTransaction}
      />
    )
  }

  /**
   * Render the transactions grid
   */
  const renderTransactions = () => {
    if(Object.keys(transactions).length === 0) return null

    //* console.debug(`[DEBUG] Redux transactions= `, transactions)
    let transactionsList = buildTransactionList()
    return (
      <TransactionGrid 
        transactions  = {transactionsList} 
        onUpdate      = {onUpdateTransaction}
      />
    )
  }

  /**
   * Sort the transactions and calculate the running balance for the account.
   * @returns Array of transactions sorted by date w/ running balance.
   */
  const buildTransactionList = () => {
    let transactionList = []
    
    //* Object.keys(transactions).forEach( (id) => {
    //*   transactionList.push(transactions[id])
    //* })

    const account = accounts[accountId]
    if(account.transactions != null) {
      transactionList = account.transactions.map( (txnId) => transactions[txnId] )
      transactionList = transactionList.sort( (a,b) => {
        return new Date(b.date) - new Date(a.date)
      })
      transactionList = runningBalance(transactionList)
    }
    return transactionList
  }

  const renderErrors = () => {
    if(error) {
      if(error.code === 401) {
        history.push('/login', {message: 'Please log in'})      // Unauthorized request, user logged out.
      }
      else {
        return (
          <Alert variant='danger'>
            {error.code}: {error.message}
          </Alert>
        )
      }
    }
    return null
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
          {renderErrors()}
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