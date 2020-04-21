//-----------------------------------------------------------------------------
// client/src/components/account/Form.js
//-----------------------------------------------------------------------------
import React                from 'react'
import { Formik }           from 'formik'
import * as Yup             from 'yup'
import {
  Container,
  Form, 
  Col,
  Button,
}                           from 'react-bootstrap'
import DatePicker           from 'react-datepicker'
import PropTypes            from 'prop-types'

import "react-datepicker/dist/react-datepicker.css";

// Define account validation schema
const accountValidationSchema = Yup.object({
  nickname: Yup.string()
    .max(128, 'Nickname must be 128 characters or less')
    .required('Nickname is required'),
  financialInstitute: Yup.string()
    .max(128, 'Financial Institute muust be 128 characters or less')
    .required('Financial Institute is required'),
  accountType: Yup.string()
    .oneOf(['Checking', 'Savings', 'Credit Card']),
  balance:    Yup.number()
    .typeError('Balance must be a number'),
  asOfDate:   Yup.date()
    .typeError('Invalid date')
    .default(function() {
      return new Date();
    })
})

/**
 * Form for adding a new account to a user's portfolio or to edit an
 * existing account.
 * 
 * @prop {string} nickname           - User defined nickname for account.
 * @prop {string} financialInstitute - FI where account is located.
 * @prop {enum}   accountType        - Checking, Savings, or Credit Card
 * @prop {number} balance            - Current account balance.
 * @prop {date}   asOfDate           - Date of balance (last txn).
 */
function AccountForm(props) {
  return (
    <Container>
      <Formik
        initialValues = {{
          nickname:           '',
          financialInstitute: '',
          accountType:        'Checking',
          balance:            '',
          asOfDate:           '',
        }}
        validationSchema = {accountValidationSchema}
        onSubmit         = {(values, {setSubmitting, resetForm}) => {
          setSubmitting(true)

          // Callback to submit form
          props.onSubmit(values, resetForm, setSubmitting)
          return
        }}
      >
        {
          ({ handleSubmit,
             handleChange,
             handleBlur,
             setFieldValue,
             values,
             touched,
             errors,
             isSubmitting }) => (
            <Form noValidate onSubmit={handleSubmit} data-testid='account-form'>
              {/* Account Nickname */}
              <Form.Group controlId='nickname'>
                <Form.Label>Account Nickname</Form.Label>
                <Form.Control
                  type        = 'text' 
                  autoFocus   = {true}
                  placeholder = 'Enter account nickname'
                  name        = 'nickname'
                  onChange    = {handleChange}
                  onBlur      = {handleBlur}
                  value       = {values.nickname}
                  isInvalid   = {touched.nickname && !!errors.nickname}
                />
                <Form.Control.Feedback type='invalid' data-testid='nickname-error'>
                  {errors.nickname ? errors.nickname : null}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Financial Institute */}
              <Form.Group controlId='financialInstitute'>
                <Form.Label>Financial Institute</Form.Label>
                <Form.Control 
                  type        = 'text'
                  placeholder = 'Enter financial institute'
                  name        = 'financialInstitute'
                  value       = {values.financialInstitute}
                  onChange    = {handleChange}
                  onBlur      = {handleBlur}
                  isInvalid   = {touched.financialInstitute && !!errors.financialInstitute}
                />
                <Form.Control.Feedback type='invalid' data-testid='fi-error'>
                  {errors.financialInstitute ? errors.financialInstitute : null}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Account Type */}
              <Form.Group controlId="accountType">
                <Form.Label>Account Type</Form.Label>
                <Form.Control 
                  as        = 'select' 
                  name      = 'accountType'
                  value     = {values.accountType} 
                  onChange  = {handleChange}>
                  <option value='Checking'>Checking</option>
                  <option value='Savings'>Savings</option>
                  <option value='Credit Card'>Credit Card</option>
                </Form.Control>
              </Form.Group>
              
              {/* Account Balance and AsOfDate */}
              <Form.Group>
                <Form.Row>
                  <Col>
                    <Form.Label>Account Balance</Form.Label>
                    <Form.Control 
                      required
                      id          = 'balance'
                      type        = 'text'
                      placeholder = 'Enter account balance'
                      name        = 'balance'
                      value       = {values.balance}
                      onChange    = {handleChange}
                      isInvalid   = {!!errors.balance}
                    />
                    <Form.Control.Feedback type="invalid" data-testid='balance-error'>
                      {errors.balance ? errors.balance : null}
                    </Form.Control.Feedback>
                  </Col>
                  <Col>
                    <Form.Label>As of Date</Form.Label>
                    <div>
                      <DatePicker
                        id          = 'asOfDate'
                        className   = 'form-control'
                        placeholder = 'mm/dd/yyyy'
                        selected    = {values.asOfDate}
                        onChange    = {(e) => setFieldValue('asOfDate', e)}
                      />
                    </div>
                  </Col>
                </Form.Row>
              </Form.Group>

              {/* Submit and Cancel Buttons */}
              <Button 
                variant   = 'primary' 
                type      = 'submit' 
                style     = {{marginRight:'1.0rem'}}
                disabled  = {isSubmitting}
              >
                Save
              </Button>
              <Button variant='secondary' onClick={props.onClose}>
                Cancel
              </Button>
            </Form>
          )
        }
      </Formik>
    </Container>
  )
}

// PropTypes
AccountForm.propTypes = {
  name:               PropTypes.string,
  financialInstitute: PropTypes.string,
  balance:            PropTypes.number,
  accountType:        PropTypes.oneOf(['Checking', 'Savings', 'Credit Card']),
  asOfDate:           PropTypes.instanceOf(Date)
};

// Export the AccountForm
export default AccountForm