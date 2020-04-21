//-----------------------------------------------------------------------------
// client/src/components/account/__tests__/Modal.test.js
//-----------------------------------------------------------------------------
import React                from 'react'

import {
  render,
  cleanup,
  fireEvent,
  getByText,
  getByPlaceholderText,
  wait,
}                           from '@testing-library/react'

import CreateAccountModal   from '../Modal'

describe('Account Form Modal', () => {
  afterEach( () => {
    cleanup()
    jest.resetAllMocks()
  })

  it('Click cancel button', () => {
    const handleClose  = jest.fn()
    const handleSubmit = jest.fn()

    const { getByText } = render(  
      <CreateAccountModal
        title     = 'Add a New Account'
        show      = {true} 
        onSubmit  = {handleSubmit}
        onClose   = {handleClose} 
      />
    )
    expect(getByText('Add a New Account')).toBeTruthy()
    
    fireEvent.click(getByText(/cancel/i))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('Click save button', async () => {
    const handleClose  = jest.fn()
    const handleSubmit = jest.fn()

    const { getByText, getByPlaceholderText } = render(  
      <CreateAccountModal
        title     = 'Add a New Account'
        show      = {true} 
        onSubmit  = {handleSubmit}
        onClose   = {handleClose} 
      />
    )
    expect(getByText('Add a New Account')).toBeTruthy()
    expect(getByText('Save')).toBeTruthy()
    expect(getByText('Cancel')).toBeTruthy()
    
    // Will not call submit because nickname and FI are blank.
    fireEvent.click(getByText('Save'))
    expect(handleSubmit).toHaveBeenCalledTimes(0)

    await wait( () => {
      fireEvent.change(getByPlaceholderText('Enter account nickname'), {
        target: {value: 'Nickname'}
      })
    })

    await wait( () => {
      fireEvent.change(getByPlaceholderText('Enter financial institute'), {
        target: {value: 'Bank'}
      })
    })

    await wait( () => fireEvent.click(getByText('Save')) )
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  /**
   * Same test as above, but wrap all of the fireEvents in the same wait()
   * wrapper.
   */
  it('Click save button', async () => {
    const handleClose  = jest.fn()
    const handleSubmit = jest.fn()

    const { getByText, getByPlaceholderText } = render(  
      <CreateAccountModal
        title     = 'Add a New Account'
        show      = {true} 
        onSubmit  = {handleSubmit}
        onClose   = {handleClose} 
      />
    )
    expect(getByText('Add a New Account')).toBeTruthy()
    expect(getByText('Save')).toBeTruthy()
    expect(getByText('Cancel')).toBeTruthy()
    
    // Will not call submit because nickname and FI are blank.
    fireEvent.click(getByText('Save'))
    expect(handleSubmit).toHaveBeenCalledTimes(0)

    await wait( () => {
      fireEvent.change(getByPlaceholderText('Enter account nickname'), {
        target: {value: 'Nickname'}
      })

      fireEvent.change(getByPlaceholderText('Enter financial institute'), {
        target: {value: 'Bank'}
      })

      fireEvent.click(getByText('Save'))
    })

    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })
})
