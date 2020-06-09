//-----------------------------------------------------------------------------
// client/src/ducks/users.rb
//-----------------------------------------------------------------------------
import { combineReducers }            from 'redux'
import AuthAPI                        from '../api/auth-api'

//
// User Authentication Action Types
//
export const types = {
  USER_SIGNUP:        'USER_SIGNUP',
  USER_SIGNUP_ERROR:  'USER_SIGNUP_ERROR',
  USER_LOGIN:         'USER_LOGIN',
  USER_LOGIN_ERROR:   'USER_LOGIN_ERROR',
  USER_LOGOUT:        'USER_LOGOUT',
  USER_LOGOUT_ERROR:  'USER_LOGOUT_ERROR',
}

//
// User Authentication Actions
//
export const actions = {
  /**
   * Sign up the user for a new dough money account.
   * @param {String} email 
   * @param {String} password 
   */
  register(email, password, username = '') {
    return async function(dispatch, getState) {
      try {
        const user = await AuthAPI.register(email, password, username)
        console.log(`[info] Registered user w/ email=${email}`)

        dispatch({
          type:     types.USER_SIGNUP,
          payload:  user,
        })
      }
      catch(error) {
        console.log(`[error] Failed to register user w/ email=${email}, error=`, error)
        dispatch({
          type:     types.USER_SIGNUP_ERROR,
          payload:  {error}
        })
      }
    }
  },
  /**
   * Log the user into the app. If the user is authenticated then returns the user,
   * otherwise it returns an error message.
   * @param   {String}   email 
   * @param   {String}   password
   * @returns {Function} Redux thunk function that logs user into the app.
   */
  login(email, password) {
    return async function(dispatch, getState) {
      try {
        const user = await AuthAPI.login(email, password);
        console.log(`[info] Logged in user w/ email=${email} & password=${password}`);
  
        dispatch({
          type:     types.USER_LOGIN,
          payload:  user,
        })
      }
      catch(error) {
        console.log(`[error] Failed to login user w/ email=${email}, password=${password}, error=`, error)
        dispatch({
          type:     types.USER_LOGIN_ERROR,
          payload:  {error}
        })
      }
    }
  },
  logout() {
    AuthAPI.logout()

    return({
      type: types.USER_LOGOUT
    })
  }
}

//
// User Authentication Reducer
//
const initialState = {}
const user = (state = initialState, action) => {
  switch(action.type) {
    case types.USER_SIGNUP:
      return {
        ...state,
        ...action.payload.user,
        error:  null,
      }
    case types.USER_SIGNUP_ERROR:
      return {
        ...state,
        error:  action.payload.error,
      }
    case types.USER_LOGIN:
      return {
        ...state,
        ...action.payload.user,
        error:  null,
      }
    case types.USER_LOGIN_ERROR:
      return {
        ...state,
        error:  action.payload.error,
      }
    case types.USER_LOGOUT:
      return {
        ...initialState,
      }
    default:
      return state
  }
}

//
// Export the reducer
//
export const reducer = combineReducers({
  user
})