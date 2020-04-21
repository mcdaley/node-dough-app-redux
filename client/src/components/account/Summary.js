//-----------------------------------------------------------------------------
// client/src/components/account/summary.js
//-----------------------------------------------------------------------------
import React          from 'react'
import { useHistory } from 'react-router-dom'
import {
  Col,
  Row,
}                     from 'react-bootstrap'
import numeral        from 'numeral'
import { FontAwesomeIcon }  from '@fortawesome/react-fontawesome'
import { faPiggyBank }      from '@fortawesome/free-solid-svg-icons'
import PropTypes      from 'prop-types'

/**
 * Component that provides a high-leve summary of an account.
 * 
 * @prop {string} nickname           - User defined nickname for account.
 * @prop {string} financialInstitute - FI where account is located.
 * @prop {enum}   accountType        - Checking, Savings, or Credit Card
 * @prop {number} balance            - Current account balance.
 * @prop {date}   asOfDate           - Date of balance (last txn).
 */
const AccountSummary = (props) => {
  let _id                 = props._id
  let name                = props.name
  let financialInstitute  = props.financialInstitute
  let balance             = props.balance

  let history             = useHistory()

  /**
   * Redirect the user to the account details page.
   */
  const handleClick = (evt) => {
    history.push(`/accounts/show/${_id}`)
  }

  // Render the account summary
  return (
    <Row 
      onClick   = {handleClick}
      className = 'no-gutters account-summary-container'
    >
      <Col xs={8}>
        <div className='account-name-container'>
          <div className='account-icon'>
            <FontAwesomeIcon icon={faPiggyBank} />
          </div>
          <div className='account-nickname'>
            <h2> {name} </h2>
            <h6> {financialInstitute} </h6>
          </div>
        </div>
      </Col>
      <Col>
        <div className='balance'>
          {numeral(balance).format('$0,0.00')}
        </div>
      </Col>
    </Row>
  )
}

// PropTypes
AccountSummary.propTypes = {
  _id:                PropTypes.string.isRequired,
  name:               PropTypes.string.isRequired,
  financialInstitute: PropTypes.string.isRequired,
  balance:            PropTypes.number.isRequired,
  accountType:        PropTypes.oneOf(['Checking', 'Savings', 'Credit Card']),
  asOfDate:           PropTypes.instanceOf(Date),
  onClick:            PropTypes.func,
};

// Export the AccountSummary
export default AccountSummary
