//-----------------------------------------------------------------------------
// client/src/components/account/__tests__/Form.test.js
//-----------------------------------------------------------------------------
import React        from 'react'
import {
  render,
  cleanup,
  fireEvent,
  wait,
}                   from '@testing-library/react'

import AccountForm  from '../Form'

describe('AccountForm', () => {
  afterEach(cleanup)

  it('Takes a snapshot', () => {
    const { asFragment } = render(<AccountForm />)
    
    expect(asFragment(<AccountForm />)).toMatchSnapshot()
   })

  it('Renders the form to create a new account', () => {
    const { getByLabelText, getByPlaceholderText } = render(<AccountForm />)

    expect(getByLabelText('Account Nickname')).toHaveTextContent('')
    expect(getByLabelText('Financial Institute')).toHaveTextContent('')
    expect(getByLabelText('Account Type')).toHaveTextContent('Checking')
    expect(getByPlaceholderText('Enter account balance')).toHaveTextContent('')
  })

  it('Requires values for account nickname and financial institute', async () => {
    const handler       = jest.fn(e => e.preventDefault())
    const { getByTestId, getByText } = render(<AccountForm onSubmit={handler} />)

    fireEvent.click(getByText('Save'))

    await wait(() => fireEvent.click(getByText('Save')) )

    expect(getByTestId('nickname-error')).toHaveTextContent('Nickname is required')
    expect(getByTestId('fi-error')).toHaveTextContent('Financial Institute is required')
  })

  it('Requires account balance to be a number', async () => {
    const handler = jest.fn(e => e.preventDefault())
    const { 
      getByText, 
      getByTestId,
      getByPlaceholderText }  = render(<AccountForm onSubmit={handler} />)

    await wait( () => {
      fireEvent.change(getByPlaceholderText('Enter account balance'), {
        target: {value: 'bad'}
      })
    })
    
    await wait(() => fireEvent.click(getByText('Save')) )

    expect(getByTestId('balance-error')).toHaveTextContent('Balance must be a number')
  })
})