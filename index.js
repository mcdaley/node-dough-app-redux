//-----------------------------------------------------------------------------
// index.js
//-----------------------------------------------------------------------------
require('./server/config/config')

const express         = require('express')
const bodyParser      = require('body-parser')
const cookieParser    = require('cookie-parser')

const mongoose        = require('./server/db/mongoose')
const passport        = require('./server/config/passport')
const morgan          = require('./server/config/morgan')
const logger          = require('./server/config/winston')
const authentication  = require('./server/routes/authentication')
const accounts        = require('./server/routes/accounts')
const transactions    = require('./server/routes/transactions')
const protected       = require('./server/routes/protected')

/*
 * main()
 */
const app = express()

app.use(bodyParser.json())
app.use(cookieParser())

app.use(morgan(
  ':method :url :status :response-time ms - :res[content-length] - :req[content-length] - :body ',
  { stream: logger.stream, immediate: false }
))

///////////////////////////////////////////////////////////////////////////////
// TODO: 03/24/2020
// ALLOW CORS FOR DEVELOPMENT AND TESTING. LONGTERM, NEED TO ADD THE 
// PROPER CONFIGURATION.
//
// NOTE: 05/14/2020
// I AM UNABLE TO RETRIEVE THE JWT ON THE CLIENT BECAUSE OF CORS ISSUES. THE
// BROWSER DOES NOT LET THE REACT APP TO ACCESS THE COOKIES, IN ORDER TO 
// ATTEMPT TO OVERRIDE I MADE THE FOLLOWING CHANGES TO THE RESPONSE HEADERS.
//
//  res.header("Access-Control-Allow-Credentials", "true")
//  res.header("Access-Control-Allow-Origin",      "http://localhost:3000")
//  res.header("Access-Control-Allow-Headers",     "Origin, X-Requested-With, Content-Type, Accept")
//  res.header("Access-Control-Expose-Headers",    "Date, Set-Cookie, ETag")
//
// I ALSO CONFIGURED THE CLIENT TO MAKE THE AXIOS POST CALL WITH THE OPTION:
//  {withCredentials: true}
//
// GOING TO MOVE THE AUTHENTICATION IN THE Authorization HEADER USING A 
// BEARER TOKEN AND OUT OF THE COOKIES.
//
// ADDING THESE NOTES, SO THAT I CAN REMEMBER MY ISSUES WHEN I IMPLEMENT
// THE "cors" PACKAGE.
///////////////////////////////////////////////////////////////////////////////
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin",      "*")
  res.header("Access-Control-Allow-Methods",     "POST, PUT, GET, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers",     "X-Requested-With, Content-Type, Accept, Authorization")
  res.header("Access-Control-Expose-Headers",    "Date, Authorization")
  next();
});

app.use('/api', authentication)
app.use('/api', accounts)
app.use('/api', transactions)
app.use('/api', protected)

const PORT = process.env.PORT
app.listen(PORT, () => {
  logger.info(`node-dough-app running on ${PORT}`)
})

// Export the app
module.exports = { app }
