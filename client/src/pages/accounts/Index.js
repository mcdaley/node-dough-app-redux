//-----------------------------------------------------------------------------
// client/src/pages/accounts/Index.js
//-----------------------------------------------------------------------------
import React, { useState, useEffect }   from 'react'
import { useSelector, useDispatch }     from 'react-redux'
import {
  Container,
  Row,
  Button,
  Alert,
}                                       from 'react-bootstrap'

import AccountList        from '../../components/account/List'
import CreateAccountModal from '../../components/account/Modal'
import { actions }        from '../../ducks/accounts'

/**
 * Page that displays a summary of all the user's accounts added to the
 * dough app. The component fetches all of the user's accounts when it loads
 * and allows the user to add new accounts.
 */
function PagesAccountsIndex() {

  /////////////////////////////////////////////////////////////////////////////
  // TODO: 04/21/2020
  // [x] 1.) FIX ALL OF THE FAILED CLIENT TESTS
  // 2.) NEED TO TEST USE CASES WHEN I DISPATCH ERRORS WHEN I CREATE AN ACCOUNT!
  // 3.) VERIFY THAT I DO NOT FETCH THE ACCOUNTS WHEN I RELOAD THE PAGE
  //     AND THE ACCOUNTS ARE AVAILABLE IN THE REDUX STORE.
  /////////////////////////////////////////////////////////////////////////////
  const accounts  = useSelector(state => state.accounts.byId)
  const errors    = useSelector(state => state.errors)

  const dispatch  = useDispatch()
  
  /////////////////////////////////////////////////////////////////////////////
  // TODO: 05/15/2020
  // NEED TO HANDLE THE 401 UNAUTHORIZED ERRORS, SHOULD REDIRECT THE USER
  // TO THE /login PAGE W/ THE ERROR MESSAGE.
  //  1.) NEED TO SET THE ERROR  FLAG AND REDIRECT THE USER
  //  2.) NEED TO NOT TRY TO RENDER THE ACCOUNTS LIST.
  /////////////////////////////////////////////////////////////////////////////
  /**
   * Fetch user's accounts when the page loads.
   */
  useEffect( () => {
    const fetchData = () => {
      dispatch(actions.fetchAccounts())
    }
    if(accounts && Object.keys(accounts).length === 0) {
      fetchData() 
    }
  }, [])


  // Toggle the visibility of the create account modal.
  const [show, setShow] = useState(false)
  const showAddAccountModal = () => setShow(true)
  const hideAddAccountModal = () => setShow(false)

  // Handle create account errors
  //* const [errors, setErrors] = useState({})

  /**
   * Callback to create the account once the user has entered form fields.
   * @param {Object}   values        - Fields from the create account form
   * @param {Function} resetForm     - callback to clear form fields
   * @param {Function} setSubmitting - callback to reset form
   */
  const handleSubmit = async (values, resetForm, setSubmitting) => {
    //* console.log(`[info] Create account w/ input form fields= `, values)

    // Create the account and update the state
    dispatch(actions.createAccount({
      name:               values.nickname,
      financialInstitute: values.financialInstitute,
      type:               values.accountType,
      openingBalance:     values.openingBalance,
      openingDate:        values.openingDate,
    }))
  
    // Cleanup and close the modal.
    resetForm()
    setSubmitting(false)
    hideAddAccountModal()
  }

  /**
   * Display a message if there was an error fetching the user's accounts
   * or if there was an error creating a new account.
   */
  function displayError() {
    if(errors == null) { return null }

    return (
      <Alert variant='danger' style={{width:'100%'}}>
        {errors.server.message}
      </Alert>
    )
  }

  /**
   * Return an array of accounts when the page loads by converting the
   * accounts in the redux-store from an object w/ account Ids as keys
   * to an array of accounts. If the accounts have not been loaded 
   * then return an empty array.
   */
  const buildAccountList = () => {
    if(accounts == null) {
      return []
    }

    const  accountsList = Object.keys(accounts).map( (accountId) => accounts[accountId])
    return accountsList
  }

  /**
   * Render the Accounts page
   */
  return (
    <Container>
      <Row>
        <CreateAccountModal
          title     = 'Add a New Account'
          show      = {show} 
          onSubmit  = {handleSubmit}
          onClose   = {hideAddAccountModal} 
        />
      </Row>
      <Row>
        <h1>Dough Money Redux - Accounts Page</h1>
      </Row>
      <Row>
        {displayError()}
      </Row>
      <Row>
        <AccountList accounts={buildAccountList()} />
      </Row>
      <Row>
        <Button variant='primary' onClick={showAddAccountModal}>
          Add Account
        </Button>
      </Row>
    </Container>
  )
}

// Export the PagesAccountsIndex
export default PagesAccountsIndex