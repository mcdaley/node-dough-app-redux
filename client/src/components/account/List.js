//-----------------------------------------------------------------------------
// client/src/components/account/List.js
//-----------------------------------------------------------------------------
import React          from 'react'
import {
  ListGroup,
}                     from 'react-bootstrap'
import PropTypes      from 'prop-types'

import AccountSummary from './Summary'

/**
 * Component that returns an array account-summary components.
 * @prop {Array} accounts - An array of accounts.
 */
const AccountList = (props) => {
  let accounts = props.accounts
  /**
   * Build array of account summary components to display.
   */ 
  const displayAccounts = (props) => {
    if(accounts.length === 0) { return null }

    const accountsList = accounts.map( (account) => {
      return (
        <ListGroup.Item key={account._id} data-testid='row'>
          <AccountSummary
            _id                 = {account._id}
            name                = {account.name}
            financialInstitute  = {account.financialInstitute}
            balance             = {account.balance}
          />
        </ListGroup.Item>
      )
    })
    return accountsList
  }

  // Render the accounts list
  return (
    <ListGroup variant='flush' style={{width:'100%'}}>
      {displayAccounts()}
    </ListGroup>
  )
}

// PropTypes
AccountList.propTypes = {
  accounts: PropTypes.array.isRequired
}

// Export the accounts list
export default AccountList