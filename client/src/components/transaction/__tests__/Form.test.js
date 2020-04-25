//-----------------------------------------------------------------------------
// client/src/components/transaction/__tests__/Form.test.js
//-----------------------------------------------------------------------------
import React            from 'react'
import {
  render,
  cleanup,
}                       from '@testing-library/react'

import TransactionForm  from '../Form'

/**
 * TransactionForm Tests
 */
describe('TransactionForm', () => {
  const handler       = jest.fn(e => e.preventDefault())
  afterEach(cleanup)
    
  it('Takes a snapshot', () => {
    const { asFragment } = render(
      <TransactionForm accountId='xxx' onSubmit={handler} />
    )
    
    expect(asFragment(
      <TransactionForm  accountId='xxx' onSubmit={handler} />)).toMatchSnapshot()
  })
})