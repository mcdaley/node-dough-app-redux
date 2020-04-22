//-----------------------------------------------------------------------------
// client/src/pages/accounts/__tests__/Index.test.js
//-----------------------------------------------------------------------------
import React              from 'react'
import { MemoryRouter }   from 'react-router-dom'
import {
  render,
  cleanup,
  fireEvent,
  waitForElement,
  getByText,
  wait,
}                         from '@testing-library/react'
import { Provider }       from 'react-redux'

import configureStore     from '../../../ducks/configureStore'
import accountsApiMock    from '../../../api/accounts-api'
jest.mock('../../../api/accounts-api') 

import PagesAccountsIndex from '../Index'

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
  },
  { 
    _id:                '2', 
    name:               'Test Credit Card', 
    financialInstitute: 'Credit Union', 
    type:               'Credit Card', 
    balance:            500.00,
    initialDate:        '2020-03-31T07:00:00.000Z',
    userId:             'Me',
  }
]

/**
 * Helper function to create the redux store when I render a component
 * for testing.
 * @param   {Component} component - component to render/test
 * @param   {*}         store     - redux store
 * @returns Component to render.
 */
const renderWithRedux = (component, store = configureStore()) => {
  return {
    ...render(<Provider store={store}>{component}</Provider>), 
    store
  }
}

/**
 * PagesAccountsIndex Tests
 */
describe('PagesAccountsIndex', () => {
  afterEach( () => {
    cleanup()
    jest.resetAllMocks()
  })

  /**
   * TEST Page Render
   */
  describe('Fetch accounts', () => {
    it('Returns a list of accounts', async () => {
      // Mock the fetch call by passing in an array of accountsData
      accountsApiMock.get.mockResolvedValueOnce(accountsData)
  
      const { getAllByTestId } = renderWithRedux(
        <MemoryRouter>
          <PagesAccountsIndex />
        </MemoryRouter>
      )
  
      const rowValues = await waitForElement( () => getAllByTestId('row') )
  
      expect(accountsApiMock.get).toHaveBeenCalledTimes(1)
      expect(rowValues.length).toBe(2)
      expect(rowValues[0].querySelector('h2')).toHaveTextContent(accountsData[0].name)
      expect(rowValues[0].querySelector('h6')).toHaveTextContent(accountsData[0].financialInstitute)
      expect(rowValues[1].querySelector('h2')).toHaveTextContent(accountsData[1].name)
      expect(rowValues[1].querySelector('h6')).toHaveTextContent(accountsData[1].financialInstitute)
    })
  })

  /**
   * TEST Opening Account Model
   */
  describe('Add acount modal', () => {
    it('Opens the modal', async () => {
      // Mock the fetch call by passing in an array of accountsData
      accountsApiMock.get.mockResolvedValueOnce(accountsData)

      const { getByText } = renderWithRedux(
        <MemoryRouter>
          <PagesAccountsIndex />
        </MemoryRouter>
      )

      await wait( () => fireEvent.click(getByText('Add Account')) )
      
      expect(getByText('Add a New Account')).toBeTruthy()
      expect(getByText('Save')).toBeTruthy()
      expect(getByText('Cancel')).toBeTruthy()
    })
  })

  /**
   * TEST Create New Account
   */
  describe('Create account', () => {
    /**
     * Create account test runs through the complete cycle of the accounts
     * page by going through the following steps: 
     * 1.) Verify the user's accounts are fetched and displayed.
     * 2.) Open the create-account-modal.
     * 3.) Fill in values for nickname and FI and submit the form.
     * 4.) Mock the AccountsAPI.create() to return a new account.
     * 5.) Verify the account was create and added to the list of user's accounts.
     */
    const params  = {
      _id:                '999',      // Must be unique since used as key.
      name:               'Test Credit Card', 
      financialInstitute: 'Credit Union', 
      type:               'Credit Card', 
      balance:            500.00,
      initialDate:        '2020-03-31T07:00:00.000Z',
    }

    it('Returns a new account', async () => {
      // Mock the get accounts api call, returns an array of accounts.
      accountsApiMock.get.mockResolvedValueOnce(accountsData)

      // Mock the create account api call, returns a new account.
      accountsApiMock.create.mockResolvedValueOnce(params)

      // Render the accounts page.
      const { getByText, getByPlaceholderText, getAllByTestId } = renderWithRedux(
        <MemoryRouter>
          <PagesAccountsIndex />
        </MemoryRouter>
      )

      await wait( () => fireEvent.click(getByText('Add Account')) )

      // Verify add new account modal opened
      expect(getByText('Add a New Account')).toBeTruthy()
      expect(getByText('Save')).toBeTruthy()
      expect(getByText('Cancel')).toBeTruthy()

      // Fill in the new account form and submit.
      await wait( () => {
        fireEvent.change(getByPlaceholderText('Enter account nickname'), {
          target: {value: params.name}
        })
  
        fireEvent.change(getByPlaceholderText('Enter financial institute'), {
          target: {value: params.financialInstitute}
        })

        fireEvent.change(getByPlaceholderText('Enter account balance'), {
          target: {value: params.balance}
        })
  
        fireEvent.click(getByText('Save'))
      })

      // Verify account was created and added to the list of accounts
      const accountList = await waitForElement( () => getAllByTestId('row') )
  
      expect(accountsApiMock.create).toHaveBeenCalledTimes(1)
      expect(accountList.length).toBe(3)
    })
  })
})