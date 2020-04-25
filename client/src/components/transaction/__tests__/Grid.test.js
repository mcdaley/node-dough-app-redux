//-----------------------------------------------------------------------------
// client/src/components/transaction/__tests__/Grid.test.js
//-----------------------------------------------------------------------------
import React            from 'react'
import {
  render,
  cleanup,
}                       from '@testing-library/react'

import TransactionGrid  from '../Grid'

/**
 * TransactionGrid Tests
 */
describe('TransactionGrid', () => {
  const handler       = jest.fn(e => e.preventDefault())
  afterEach(cleanup)
    
  it('Takes a snapshot', () => {
    const { asFragment } = render(
      <TransactionGrid transactions={[]} />
    )
    
    expect(asFragment(
      <TransactionGrid  transactions={[]} />)).toMatchSnapshot()
  })
})