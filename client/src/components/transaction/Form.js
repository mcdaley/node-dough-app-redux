//-----------------------------------------------------------------------------
// client/src/components/transaction/Form.js
//-----------------------------------------------------------------------------
import React, { useState }  from 'react'
import { Formik }           from 'formik'
import * as Yup             from 'yup'
import {
  Button,
  Form,
  Table,
}                           from 'react-bootstrap'
import DatePicker           from 'react-datepicker'

import TransactionsAPI      from '../../api/transactions-api'

// Define transaction validation schema
const transactionValidationSchema = Yup.object({
  date: 
    Yup.date()
      .typeError('Invalid date')
      .default(function() {
        return new Date();
      }),
  description: 
    Yup.string()
      .max(128, 'Description must be 128 characters or less')
      .required('Description is required'),
  category: 
    Yup.string()
      .max(128, 'Category muust be 128 characters or less'),
  debit: 
    Yup.number()
      .typeError('Debit must be a number'),
  credit: 
    Yup.number()
      .typeError('Credit must be a number'),
})

/**
 * The TransactionForm component is used to add a new transaction to an account.
 * 
 * @prop {String}   accountId - Unique account identifier
 * @prop {function} onSubmit  - Callback to save the transaction
 */
const TransactionForm = (props) => {
  const { accountId }                 = props

  /**
   * Calculate the amount of the transaction. If the amount is a debit then
   * ensure itis a negative number, if the amount is a credit then ensure 
   * it is a positive number. If an amount was not specified set the default
   * amount to 0.
   * 
   * @param   {String} debit
   * @param   {String} credit
   * @returns {Number} Transaction amount
   */
  const getAmount = (debit, credit) => {
    if(debit === '' && credit === '') {
      return 0
    }
    else if(debit !== '') {
      return -1 * Math.abs(parseFloat(debit))
    }
    else {
      return Math.abs(parseFloat(credit))
    }
  }

  /**
   * Render the TransactionForm
   */
  return (
    <div>
      <Formik
        initialValues = {{
          date:         '',
          description:  '',
          category:     '',
          debit:        '',
          credit:       '',
        }}
        validationSchema = {transactionValidationSchema}
        onSubmit         = { async (values, {setSubmitting, resetForm}) => {
          //* console.log(`[debug] onSubmit callback, values= `, values)
          
          setSubmitting(true)

          let transaction = {
            date:         values.date,
            description:  values.description,
            category:     values.category,
            amount:       getAmount(values.debit, values.credit),
          }

          try {
            let result = await TransactionsAPI.create(accountId, transaction)
            //* console.log(`[info] Created transaction: ${JSON.stringify(result, undefined, 2)}`)
      
            props.onSubmit(result)
            resetForm()
            setSubmitting(false)
          }
          catch(error) {
            console.log(`[error] Failed to create transaction, error= `, error)
          }
        }}
      >
        {
          ({
            handleSubmit,
            handleChange,
            handleBlur,
            setFieldValue,
            values,
            touched,
            errors,
            isSubmitting,
            resetForm
          }) => (
            <Form noValidate onSubmit={handleSubmit} style={{marginBottom: '1.0rem'}}>
              <Table size='sm' variant='dark'>
                <tbody>
                  <tr>
                    <td style={{width: '15%'}}>
                      <Form.Group controlId='txn-date' style={{marginBottom: 0}}>
                        <div>
                          <DatePicker
                            id          = 'date'
                            className   = 'form-control'
                            placeholder = 'mm/dd/yyyy'
                            selected    = {values.date}
                            onChange    = {(e) => setFieldValue('date', e)}
                          />
                        </div>
                      </Form.Group>
                    </td>
                    <td style={{width: '25%'}}>
                      <Form.Group controlId='txn-description' style={{marginBottom: 0}}>
                        <Form.Control 
                          type        = 'text' 
                          placeholder = 'Description'
                          name        = 'description'
                          value       = {values.description}
                          onChange    = {handleChange}
                          onBlur      = {handleBlur}
                          isInvalid   = {touched.description && !!errors.description}
                        />
                        <Form.Control.Feedback type='invalid' data-testid='description-error'>
                          {errors.description ? errors.description : null}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </td>
                    <td style={{width: '15%'}}> 
                      <Form.Group controlId='txn-category' style={{marginBottom: 0}}>
                        <Form.Control 
                          type        = 'text' 
                          placeholder = 'Category'
                          name        = 'category'
                          value       = {values.category}
                          onChange    = {handleChange}
                          onBlur      = {handleBlur}
                          isInvalid   = {touched.category && !!errors.category}
                        />
                        <Form.Control.Feedback type='invalid' data-testid='category-error'>
                          {errors.category ? errors.category : null}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </td>
                    <td style={{width: '15%'}}> 
                      <Form.Group controlId='txn-debit' style={{marginBottom: 0}}>
                        <Form.Control 
                          type        = 'text' 
                          placeholder = 'Debit'
                          name        = 'debit'
                          value       = {values.debit}
                          onChange    = {(e) => {
                            setFieldValue('debit',  e.target.value)
                            setFieldValue('credit', '')
                          }}
                          onBlur      = {handleBlur}
                          isInvalid   = {touched.debit && !!errors.debit}
                        />
                        <Form.Control.Feedback type='invalid' data-testid='debit-error'>
                          {errors.debit ? errors.debit : null}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </td>
                    <td style={{width: '15%'}}>
                      <Form.Group controlId='txn-credit' style={{marginBottom: 0}}>
                        <Form.Control 
                          type        = 'text' 
                          placeholder = 'Credit'
                          name        = 'credit'
                          value       = {values.credit}
                          onChange    = {(e) => {
                            setFieldValue('credit', e.target.value)
                            setFieldValue('debit',  '')
                          }}
                          onBlur      = {handleBlur}
                          isInvalid   = {touched.credit && !!errors.credit}
                        />
                        <Form.Control.Feedback type='invalid' data-testid='credit-error'>
                          {errors.credit ? errors.credit : null}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </td>
                    <td style={{width: '15%'}}>
                      <Button 
                        variant   = 'primary' 
                        type      = 'submit'
                        size      = 'md'
                        style     = {{marginLeft: '0.50rem', marginRight: '0.50rem'}}
                        disabled  = {isSubmitting}
                      >
                          Save
                      </Button>
                      <Button 
                        variant   = 'secondary'
                        size      = 'md'
                        onClick   = {resetForm}
                      >
                          Clear
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Form>
          )
        }
      </Formik>
    </div>
  )
}

// Export the TransactionForm
export default TransactionForm