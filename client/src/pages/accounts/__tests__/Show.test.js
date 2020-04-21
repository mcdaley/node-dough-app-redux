//-----------------------------------------------------------------------------
// client/src/pages/accounts/__tests__/Show.test.js
//-----------------------------------------------------------------------------
import React                from 'react'
import { MemoryRouter }     from 'react-router-dom'
import {
  cleanup,
  fireEvent,
  render,
  wait,
}                           from '@testing-library/react'
import numeral              from 'numeral'

import mockTransactionsAPI  from '../../../api/transactions-api'
jest.mock('../../../api/transactions-api') 

import PagesAccountsShow    from '../Show'

// Mock account data
const accountsData = [
  { 
    _id:                '1', 
    name:               'Test Checking Account', 
    financialInstitute: 'Bank', 
    type:               'Checking', 
    balance:            100.00,
    initialDate:        '2020-03-31T07:00:00.000Z',
    userId:             'Me'
  }
]

// Mock transaction data - need to add the calculated fields for debit, credit and balance.
const transactionsData = [
  {
    _id:          '1',
    date:         '2020-03-01T07:00:00.000Z',
    description:  'Opening Balance', 
    category:     'Balance', 
    amount:       1000.00,
    debit:        '',                           // Virtual debit field
    credit:       1000.00,                      // Virtual credit field
    balance:      1000.00,                      // Virtual balance field
    accountId:    '99',
    userId:       'Me'
  },
  { 
    _id:          '2',
    date:         '2020-03-31T07:00:00.000Z',
    description:  'Expense Transaction One', 
    category:     'Groceries', 
    amount:       -100.00,
    debit:        -100.00,
    credit:       '',
    balance:      900.00,
    accountId:    '99',
    userId:       'Me'
  },
  { 
    _id:          '3',
    date:         '2020-04-05T07:00:00.000Z',
    description:  'Deposit Transaction Test', 
    category:     'Salary', 
    amount:       300.00,
    debit:        '',
    credit:       300.00,
    balance:      1200.00,
    accountId:    '99',
    userId:       'Me'
  },
  { 
    _id:          '4',
    date:         '2020-04-05T07:00:00.000Z',
    description:  'Expense Transaction Two', 
    category:     'Household', 
    amount:       -55.55,
    debit:        -55.55,
    credit:       '',
    balance:      1145.00,
    accountId:    '99',
    userId:       'Me'
  },
]

// Add the URL to the MemoryRouter, as the page needs the accountId as a 
// param to the TransactionsAPI.findByAccountId()
const account = accountsData[0]
const url     = `/accounts/show/${account._id}`

describe('PagesAccountsShow', () => {
  afterEach( () => {
    cleanup()
    jest.resetAllMocks()
  })

  /**
   * TEST Page Render
   */
  it('Renders the page', async () => {
    // Mock TransactionsAPI.findByAccountId()
    mockTransactionsAPI.findByAccountId.mockResolvedValueOnce({
      account:      accountsData[0],
      transactions: transactionsData,
    })

    // Add the URL to the MemoryRouter, as the page needs the accountId as a 
    // param to the TransactionsAPI.findByAccountId()
    const { container, getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={[url]} initialIndex={0}>
        <PagesAccountsShow />
      </MemoryRouter>
    )

    await wait( () => expect(getByText(account.name)).toBeInTheDocument() )

    expect(mockTransactionsAPI.findByAccountId).toHaveBeenCalledTimes(1)
    expect(getByText(account.financialInstitute)).toBeInTheDocument()
    expect(getByText(numeral(account.balance).format('$0,0.00'))).toBeInTheDocument()

    // Verify TransactionForm
    expect(getByPlaceholderText('Description')).toBeInTheDocument()
    expect(getByPlaceholderText('Category')).toBeInTheDocument()
    expect(getByPlaceholderText('Debit')).toBeInTheDocument()
    expect(getByPlaceholderText('Credit')).toBeInTheDocument()
    expect(getByText('Save')).toBeInTheDocument()
    
    // Verify TransactionGrid
    const transactions = container.querySelectorAll('.transaction-grid')
    expect(transactions.length).toBe(transactionsData.length)

    // Opening Balance
    let row   = transactions[0]
    let cells = row.getElementsByTagName('td')
    let txn   = transactionsData[0]

    expect(cells[1].innerHTML).toBe(txn.description)
    expect(cells[2].innerHTML).toBe(txn.category)
    expect(cells[4].innerHTML).toBe(numeral(txn.amount).format('$0,0.00'))
    expect(cells[5].innerHTML).toBe(numeral(txn.balance).format('$0,0.00'))

    // Last Transaction
    row   = transactions[transactions.length - 1]
    cells = row.getElementsByTagName('td')
    txn   = transactionsData[transactionsData.length - 1]

    expect(cells[1].innerHTML).toBe(txn.description)
    expect(cells[2].innerHTML).toBe(txn.category)
    expect(cells[3].innerHTML).toBe(numeral(txn.amount).format('$0,0.00'))
    expect(cells[5].innerHTML).toBe(numeral(txn.balance).format('$0,0.00'))
  })

  /**
   * TEST Add a Transaction
   */
  describe('Add a transaction', () => {
    let params = {
      _id:          '51',
      date:         '2020-04-10T07:00:00.000Z',
      description:  'Create Debit Transaction', 
      category:     'Entertainment', 
      amount:       -50.00,
      debit:        -50.00,
      credit:       '',
      accountId:    '99',
      userId:       'Me'
    }

    it('Requires a description', async () => {
      // Mock TransactionsAPI.findByAccountId()
      mockTransactionsAPI.findByAccountId.mockResolvedValueOnce({
        account:      accountsData[0],
        transactions: transactionsData,
      })

      const handler                  = jest.fn(e => e.preventDefault())
      const { getByText, getByTestId } = render(
        <MemoryRouter initialEntries={[url]} initialIndex={0}>
          <PagesAccountsShow  onSubmit={handler} />
        </MemoryRouter>
      )

      await wait( () => fireEvent.click(getByText('Save')) )

      expect(getByTestId('description-error')).toHaveTextContent('Description is required')
    })

    it('Requires that debit is a number', async () => {
      // Mock TransactionsAPI.findByAccountId()
      mockTransactionsAPI.findByAccountId.mockResolvedValueOnce({
        account:      accountsData[0],
        transactions: transactionsData,
      })

      const handler             = jest.fn(e => e.preventDefault())
      const { 
        getByText, 
        getByTestId,
        getByPlaceholderText }  = render(
        <MemoryRouter initialEntries={[url]} initialIndex={0}>
          <PagesAccountsShow  onSubmit={handler} />
        </MemoryRouter>
      )

      await wait( () => {
        fireEvent.change(getByPlaceholderText('Debit'), {
          target: {value: 'BAD'}
        })
      })
      
      await wait(() => fireEvent.click(getByText('Save')) )
  
      expect(getByTestId('debit-error')).toHaveTextContent('Debit must be a number')
    })

    it('Requires that credit is a number', async () => {
      // Mock TransactionsAPI.findByAccountId()
      mockTransactionsAPI.findByAccountId.mockResolvedValueOnce({
        account:      accountsData[0],
        transactions: transactionsData,
      })

      const handler             = jest.fn(e => e.preventDefault())
      const { 
        getByText, 
        getByTestId,
        getByPlaceholderText }  = render(
        <MemoryRouter initialEntries={[url]} initialIndex={0}>
          <PagesAccountsShow  onSubmit={handler} />
        </MemoryRouter>
      )

      await wait( () => {
        fireEvent.change(getByPlaceholderText('Credit'), {
          target: {value: 'BAD'}
        })
      })
      
      await wait(() => fireEvent.click(getByText('Save')) )
  
      expect(getByTestId('credit-error')).toHaveTextContent('Credit must be a number')
    })
    
    it('Adds a new debit transaction to the grid', async () => {
      
      // Mock TransactionsAPI.findByAccountId() - Page Load
      mockTransactionsAPI.findByAccountId.mockResolvedValueOnce({
        account:      accountsData[0],
        transactions: transactionsData,
      })

      // Mock the TransactionsAPI.create() - Create new account
      mockTransactionsAPI.create.mockResolvedValueOnce({transaction: params})

      // Add the URL to the MemoryRouter, as the page needs the accountId as a 
      // param to the TransactionsAPI.findByAccountId()
      const { container, getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={[url]} initialIndex={0}>
          <PagesAccountsShow />
        </MemoryRouter>
      )
      
      // Wait for the page to load
      await wait( () => expect(getByText(account.name)).toBeInTheDocument() )

      // Fill in the transaction form and submit it
      await wait( () => {
        fireEvent.change(getByPlaceholderText('Description'), {
          target: {value: params.description}
        })

        fireEvent.change(getByPlaceholderText('Category'), {
          target: {value: params.category}
        })

        fireEvent.change(getByPlaceholderText('Debit'), {
          target: {value: params.debit}
        })

        fireEvent.click(getByText('Save'))
      })

      const transactions = container.querySelectorAll('.transaction-grid')
      expect(transactions.length).toBe(transactionsData.length + 1)
      expect(mockTransactionsAPI.create).toHaveBeenCalledTimes(1)

      // Verify new transaction
      let row   = transactions[0]
      let cells = row.getElementsByTagName('td')

      expect(cells[1].innerHTML).toBe(params.description)
      expect(cells[2].innerHTML).toBe(params.category)
      expect(cells[3].innerHTML).toBe(numeral(params.amount).format('$0,0.00'))
      expect(cells[4].innerHTML).toBe('')
      expect(cells[5].innerHTML).toBe(numeral(1094.45).format('$0,0.00'))
    })
  })

  /**
   * TEST Edit a Transaction
   */
  describe('Edit a Transaction', () => {

  })

})
