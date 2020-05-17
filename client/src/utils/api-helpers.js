//-----------------------------------------------------------------------------
// client/src/utils/api-helpers.js
//-----------------------------------------------------------------------------

/**
 * Handle axios errors in the API calls to the dough server. In the API, I
 * send an json response w/ the format of { code: '', message: ''} and if 
 * axios catches an error then the original response is stored in the 
 * err.response.data, so I need to parse the error out of the response if
 * it is set. If the error does not have a response object then return a
 * default server error.
 * 
 * @param   {Error}  err - Error caught by the axios request.
 * @returns {Object} Returns error object w/ "code" and "message" attributes.
 */
export const handleErrors = (err, message = 'server error') => {
  let error = {}

  if(err.response && err.response.status === 401) {
    //* console.log(`[DEBUG] Axios status=[401] error= `, JSON.stringify(err, undefined, 2))
    error = err.response.data.error
  }
  else if(err.response && err.response.status === 400) {
    //* console.log(`[DEBUG] Axios status=[400] error= `, JSON.stringify(err, undefined, 2))
    if(err.response.data.errors) {
      // Handle multiple form input validation errors
      err.response.data.errors.forEach( (e) => {
        error[e.path] = {
          code:     e.code, 
          field:    e.path, 
          message:  e.message}
      })
    }
    else if(err.response.data.error){
      error = err.response.data.error
    }
    else {
      error = {
        code:     400,
        message: 'Bad Request',
      }
    }
  }
  else if(err.response && err.response.status === 404) {
    // 404 Error
    //* console.log(`[DEBUG] Axios status=[404] error= `, JSON.stringify(err, undefined, 2))
    error = err.response.data.error
  } 
  else if (error.request) {
    // Request was made but no response was received
    error = {
      code:     500,
      message:  'Unable to connect to the server',
    }
  } 
  else {
    // Unknown server error
    error = {
      code:     500,
      message:  message,
    }
  }
  
  return error
}
