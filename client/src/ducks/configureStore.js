//-----------------------------------------------------------------------------
// client/src/ducks/configureStore.js
//-----------------------------------------------------------------------------
import {
  combineReducers,
  compose,
  createStore,
  applyMiddleware,
}                                   from 'redux'
import thunk                        from 'redux-thunk'
import { composeWithDevTools }      from 'redux-devtools-extension'

import { reducer as accounts }      from './accounts'
import { reducer as transactions }  from './transactions'

export const rootReducer = combineReducers({
  accounts,
  transactions,
})

const configureStore = () => {
  return createStore(
    rootReducer,
    composeWithDevTools(
      applyMiddleware(thunk)
    )
  )
}

// Export configureStore
export default configureStore