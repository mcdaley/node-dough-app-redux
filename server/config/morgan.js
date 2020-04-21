//-----------------------------------------------------------------------------
// server/config/morgan.js
//-----------------------------------------------------------------------------
const morgan = require('morgan')

/**
 * Custom morgan token to display the http request params, query, and body
 */
morgan.token('body', function (req, res) { 
  let message = 'request: '
  if(req.params)  { message += `params= ${JSON.stringify(req.params)}, ` }
  if(req.query)   { message += `query= ${JSON.stringify(req.query)}, `  }
  if(req.body)    { message += `body= ${JSON.stringify(req.body)}` }

  return message
})

// Export morgan
module.exports = morgan

