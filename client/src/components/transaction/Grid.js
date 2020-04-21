//-----------------------------------------------------------------------------
// client/src/components/transaction/Grid.js
//-----------------------------------------------------------------------------
import React, { useState }        from 'react'
import numeral                    from 'numeral'

import BootstrapTable             from 'react-bootstrap-table-next'
import cellEditFactory, { Type }  from 'react-bootstrap-table2-editor'

///////////////////////////////////////////////////////////////////////////////
// TODO: 04/14/2020
// UPDATE THE TRANSACTIONS GRID W/ THE FOLLOWING:
//  [x] - ADD SELECT MENU FOR CATEGORIES.
//  [x] - FIGURE OUT HOW TO CALL THE UPDATE API TO UPDATE THE TRANSACTION.
//  [x] - VERIFY THE RUNNING BALANCE IS UPDATED.
//  [x] - FIGURE OUT HOW TO GET THE INDEX OF THE EDITED TRANSACTION INSTEAD OF
//        LOOPING THROUGH THE ARRAY OF TRANSACTIONS.
//  [x] - CLEAR OLD VALUES FOR DEBIT AND CREDIT.
//  - USE react-date-picker FOR EDITING TRANSACTION DATES.
///////////////////////////////////////////////////////////////////////////////

/**
 * Component that returns a grid container a list of transactions.
 * 
 * @param {prop} transactions - Array of transactions
 */
const TransactionGrid = (props) => {

  const columns      = [
    {
      dataField:    'date',
      text:         'Date',
      formatter:    (cell) => {
        let dateObj = cell;
        if (typeof cell !== 'object') {
          dateObj = new Date(cell);
        }
        return `${('0' + (dateObj.getUTCMonth() + 1)).slice(-2)}/${('0' + dateObj.getUTCDate()).slice(-2)}/${dateObj.getUTCFullYear()}`;
      },
      editor:       { type: Type.DATE },
      align:        'center',
      headerAlign:  'center',
      headerStyle:  { width: '15%' },
    }, 
    {
      dataField:    'description',
      text:         'Description',
      classes:      'test-id-grid',
      validator:    (newValue, row, column) => {
        if(newValue === '') {
          return {
            valid:    false,
            message: 'Description is required'
          }
        }
        return true
      },
      headerStyle:  { width: '25%' }
    }, 
    {
      dataField:    'category',
      text:         'Category',
      editor:       {
        type:    Type.SELECT,
        options: [{
          value: '',
          label: ''
        }, {
          value: 'Groceries',
          label: 'Groceries',
        }, {
          value: 'Household',
          label: 'Household',
        }, {
          value: 'Dining',
          label: 'Dining',
        }, {
          value: 'Deposit',
          label: 'Deposit',
        }, {
          value: 'Salary',
          label: 'Salary',
        }]
      },
      headerStyle:  { width: '15%' },
    },
    {
      dataField:    'debit',
      text:         'Debit',
      formatter:    (cell, row, rowIndex, extraData) => {
        if(row.amount < 0) {
          return numeral(row.amount).format('$0,0.00')
        }
        return ''
      },
      validator:    (newValue, row, column) => {
        if (isNaN(newValue)) {
          return {
            valid:    false,
            message:  'Debit must be a number'
          };
        }
        return true;
      },
      align:        'right',
      headerAlign:  'right',
      headerStyle:  { width: '15%' },
    },
    {
      dataField:    'credit',
      text:         'Credit',
      formatter:    (cell, row, rowIndex, extraData) => {
        if(row.amount > 0) {
          return numeral(row.amount).format('$0,0.00')
        }
        return ''
      },
      validator:    (newValue, row, column) => {
        if (isNaN(newValue)) {
          return {
            valid:    false,
            message:  'Credit must be a number'
          };
        }
        return true;
      },
      align:        'right',
      headerAlign:  'right',
      headerStyle:  { width: '15%' },
    },
    {
      dataField:    'balance',
      text:         'Balance',
      formatter:    (num) => num === '' ? num : numeral(num).format('$0,0.00'),
      editable:     false,
      align:        'right',
      headerAlign:  'right',
      headerStyle:  { width: '15%' },
    },
  ]

  /**
   * Called right before the application saves the changes to a cell. It
   * handles the logic for editing the values for debit and credit using
   * the amount.
   * @param {*} oldValue 
   * @param {*} newValue 
   * @param {*} row 
   * @param {*} column 
   */
  const handleBeforeSaveCell = (oldValue, newValue, row, column) => {
    if(oldValue === newValue) return

    let updateParams = {}
    if(column.dataField === 'debit') {
      updateParams.amount = -1 * Math.abs(newValue)
    }
    else if(column.dataField === 'credit') {
      updateParams.amount = Math.abs(newValue)
    }
    else {
      updateParams[column.dataField] = newValue
    }

    props.onUpdate(row.accountId, row._id, updateParams)
    return
  }

  /**
   * Render the transactions grid
   */
  return (
    <BootstrapTable 
      keyField    = '_id' 
      data        = { props.transactions } 
      columns     = { columns } 
      cellEdit    = { cellEditFactory({
        mode:           'click',
        blurToSave:     true,
        beforeSaveCell: (oldValue, newValue, row, column) => {
          handleBeforeSaveCell(oldValue, newValue, row, column)
        }
      }) }
      rowClasses  = 'transaction-grid'    // Dummy class for each row needed for testing
      tabIndexCell
      condensed
      striped
    />
  )
}

// Export the TransactionGrid
export default TransactionGrid