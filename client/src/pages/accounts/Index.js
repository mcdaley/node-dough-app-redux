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
import AccountsAPI        from '../../api/accounts-api'
import { actions }        from '../../ducks/accounts'

/**
 * Page that displays a summary of all the user's accounts added to the
 * dough app. The component fetches all of the user's accounts when it loads
 * and allows the user to add new accounts.
 */
function PagesAccountsIndex() {

  const report    = useSelector(state => state.accounts.data)
  const dispatch  = useDispatch()
  useEffect( () => {
    const fetchData = async () => {
      dispatch(actions.fetchAccounts())
      //* console.log(`[debug] Fetched report= `, report)
    }
    fetchData()
  }, [])

  // Fetch user accounts when page loads
  const [accounts, setAccounts] = useState([])
  /*****/
  useEffect( () => {
    const fetchData = async () => {
      try {
        let accounts = await AccountsAPI.get()
        
        //* console.log(`[debug] AccountsAPI.get(), accounts = `, accounts)
        setAccounts(accounts);
      } 
      catch (error) {
        console.log(`[error] Failed to retrieve user accounts, error= `, error)
        setErrors(error)
      }
    }
    fetchData()
  }, [])
  /*****/

  // Toggle the visibility of the create account modal.
  const [show, setShow] = useState(false)
  const showAddAccountModal = () => setShow(true)
  const hideAddAccountModal = () => setShow(false)

  // Handle create account errors
  const [errors, setErrors] = useState({})

  /**
   * Callback to create the account once the user has entered form fields.
   * @param {Object}   values        - Fields from the create account form
   * @param {Function} resetForm     - callback to clear form fields
   * @param {Function} setSubmitting - callback to reset form
   */
  const handleSubmit = async (values, resetForm, setSubmitting) => {
    //* console.log(`[info] Create account w/ input form fields= `, values)

    // Create the account and update the state
    try {
      let account = await AccountsAPI.create({
        name:               values.nickname,
        financialInstitute: values.financialInstitute,
        type:               values.accountType,
        balance:            values.balance,
        asOfDate:           values.asOfDate,
      })

      //* setAccounts([...accounts, account])
      dispatch(actions.createAccount(account))
      console.log(`[debug] Created a new account`)
    }
    catch(error) {
      console.log(`[error] Failed to create account, error= `, error)
      setErrors(error)
    }
    finally {
      // Cleanup and close the modal.
      resetForm()
      setSubmitting(false)
      hideAddAccountModal()
    }
  }

  /**
   * Display a message if there was an error fetching the user's accounts
   * or if there was an error creating a new account.
   */
  function displayError() {
    if(errors.server == null) { return null }

    return (
      <Alert variant='danger' style={{width:'100%'}}>
        {errors.server.message}
      </Alert>
    )
  }

  const buildAccountList = () => {
    console.log(`[debug] Try to figure out the redux store:`)
    if(report == null) {
      return []
    }
    return report
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
        <h1>Dough Money - Accounts Page</h1>
      </Row>
      <Row>
        {displayError()}
      </Row>
      {/* */}
      <Row>
        <AccountList accounts={accounts} />
      </Row>
      {/* */}
      <Row>
        <Button variant='primary' onClick={showAddAccountModal}>
          Add Account
        </Button>
      </Row>
      <Row style={{margin: '1.0rem'}}>
        <AccountList accounts={buildAccountList()} />
      </Row>
    </Container>
  )
}

// Export the PagesAccountsIndex
export default PagesAccountsIndex