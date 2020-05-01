//-----------------------------------------------------------------------------
// server/routes/transactions.js
//-----------------------------------------------------------------------------
const express                   = require('express')
const { ObjectID }              = require('mongodb')

const Transaction               = require('../models/transaction')
const Account                   = require('../models/account')
const logger                    = require('../config/winston')
const {
  handleErrors,
  validateAndFindAccountId,
  validateAndFindTransactionId,
}                               = require('../utils/route-helpers')
const { DBModelIdError }        = require('../utils/custom-errors')
const { currentUser }           = require('../utils/current-user-helper')


// Get the Express Router
const router  = express.Router()

/*
 * GET /v1/accounts/:accountId/transactions/:id
 */
router.get('/v1/accounts/:accountId/transactions/:id', async (req, res) => {
  logger.info(
    'GET /api/v1/accounts/:id/transactions/:id, params= %o', req.params
  )

  let accountId     = req.params.accountId
  let transactionId = req.params.id

  try {
    let user        = await currentUser()
    let account     = await validateAndFindAccountId(accountId)
    let transaction = await validateAndFindTransactionId(transactionId)

    logger.info(
      'Retrieved transaction w/ account id=[%s], transaction= %o',
      accountId, transaction
    )
    res.status(200).send({transaction})
  }
  catch(err) {
    logger.error(
      'Failed to retrieve transaction id=[%s] for account id=[%s], error= %o',
      transactionId, accountId, err
    )
    if(err instanceof DBModelIdError) {
      return res.status(404).send(err)
    }
    res.status(400).send(err)
  }
})

/*
 * GET /api/v1/accounts/:accountId/transactions
 */
router.get('/v1/accounts/:accountId/transactions', async (req, res) => {
  logger.info(
    'GET /api/v1/accounts/:accountId/transactions, params= %o', req.params
  )

  /**
   * Calculate the running balance for all of the transactions in the account
   * and return the updated array of transactions w/ the running balance for
   * each transaction.
   * 
   * The calculation assumes the transactions are returned sorted by
   * descending date order.
   * 
   * @param   {object} account 
   * @param   {array} transactions
   * @returns Array of transactions w/ running balance for each transaction.
   */
  function runningBalance(account, transactions) {
    let rear                   = transactions.length - 1
    transactions[rear].balance = transactions[rear].amount

    for(let i = rear - 1; i >= 0; --i) {
      transactions[i].balance  = transactions[i+1].balance + transactions[i].amount
    }

    return transactions
  }

  /////////////////////////////////////////////////////////////////////////////
  // TODO: 04/07/2020
  // NEED TO ENSURE THE USER CAN ONLY RETURN TRANSACTIONS FOR AN ACCOUNT
  // THAT THE USER OWNS. WILL NEED TO IMPLEMENT THIS FEATURE WHEN I ADD
  // AUTHENTICATION.
  /////////////////////////////////////////////////////////////////////////////
  
  let accountId = req.params.accountId

  try {
    let user         = await currentUser()

    let account      = await validateAndFindAccountId(accountId)
    let transactions = await Transaction.find({accountId: accountId}).sort({ date: -1})
    transactions     = runningBalance(account, transactions)

    logger.debug('Transactions w/ balance= [%o]', transactions)

    logger.debug(
      'Retrieved [%d] transactions for accountId=[%s], %o', 
      transactions.length, accountId, transactions
    )
    res.status(200).send({account, transactions})
  }
  catch(err) {
    logger.error(
      'Failed to retrieve transactions for accountId=[%s], error= %o', 
      accountId, err
    )
    if(err instanceof DBModelIdError) {
      return res.status(404).send(err)
    }
    res.status(400).send(err)
  }
})

/*
 * POST /api/v1/accounts/:accountId/transactions
 */
router.post('/v1/accounts/:accountId/transactions', async (req, res) => {
  logger.info(
    'POST /api/v1/accounts/:accountId/transactions, params= %o, body= %o', 
    req.params, req.body
  )

  /////////////////////////////////////////////////////////////////////////////
  // TODO: 04/07/2020
  // I WILL NEED TO CLEANUP THE LOGIC FOR USING THE USER-ID. RIGHT NOW, THE
  // USER-ID IS REQUIRED IN THE API CALL. IN THE FUTURE, I WILL BE ABLE TO
  // GET THE USER-ID FROM THE AUTHENTICATION CHECK AND I SHOULD USE THAT
  // FOR VALIDATING THE ACCOUNT.
  /////////////////////////////////////////////////////////////////////////////

  let accountId = req.params.accountId    // Get account id from url

  try {
    let user    = await currentUser()

    let account = await validateAndFindAccountId(accountId)

    let transaction = new Transaction({
      date:         req.body.date     ? new Date(req.body.date) : new Date(),
      category:     req.body.category || '', 
      description:  req.body.description,
      amount:       req.body.amount   || 0,
      accountId:    accountId,
      userId:       user._id,                       
    })
    logger.debug('Built transaction= %o', transaction)

    let result    = await transaction.save()
    let statement = await Account.findOneAndUpdate(
      { _id:      accountId },
      { balance:  (account.balance + transaction.amount) },
      { new:      true }
    )
    
    logger.debug('Successfully created transaction= %o', result)
    logger.debug('Updated account id=[%s], balance=[%s]', statement._id, statement.balance)
    res.status(201).send({transaction: result, account: statement})
  }
  catch(err) {
    logger.error('Failed to create transaction, err= %o', err)
    
    const errorResponse = handleErrors(err)
    res.status(errorResponse.status).send(errorResponse)
  }
})

/**
 * PUT /api/v1/accounts/:accountId/transactions/:id
 */
router.put('/v1/accounts/:accountId/transactions/:id', async (req, res) => {
  logger.info(
    'PUT /api/v1/accounts/:accountId/transactions/:id, params= %o, body= %o', 
    req.params, req.body
  )

  let accountId     = req.params.accountId
  let transactionId = req.params.id
  
  try {
    let user    = await currentUser()   // Verify user is logged-in

    // Validate the accountId and the transactionId
    let account     = await validateAndFindAccountId(accountId, {msg: 'Transaction not found'})
    let transaction = await validateAndFindTransactionId(transactionId)

    let query   = { _id: transactionId, accountId: accountId }
    let update  = (function makeUpdateQueryParams(body) {
      let update = {}
      Object.entries(body).forEach( (entry) => {
        // Do not allow the accountId or userId to be updated.
        if(entry[0] !== 'accountId' && entry[0] !== 'userId') {
          update[entry[0]] = entry[1]
        }
      })
      return update
    })(req.body)
    let options = { new: true, runValidators: true  }

    let result  = await Transaction.findOneAndUpdate(query, update, options)
    if(result == null) {
      return res.status(404).send({
        code:     404,
        message:  'Transaction not found',
      })
    }

    // Update the account balance if the transaction amount changed.
    if(update.hasOwnProperty('amount')) {
      let balance = account.balance - transaction.amount + update.amount
      let query   = { _id:     accountId }
      let filter  = { balance: balance }
      
      account     = await Account.findOneAndUpdate(query, filter, options)
    } 
    
    logger.info(`Updated transaction for accountId[${accountId}], transaction= %o`, result)
    res.status(200).send({
      transaction:  result,
      account:      account,
    })
  }
  catch(err) {
    logger.error('Failed to update the transaction, err= %o', err)

    const errorResponse = handleErrors(err)
    res.status(errorResponse.status).send(errorResponse)
  }
})

/*
 * DELETE /api/v1/accounts/:accountId/transactions/:id
 */
router.delete('/v1/accounts/:accountId/transactions/:id', async (req, res) => {
  logger.info(
    'DELETE /api/v1/accounts/:accountId/transactions/:id, params= %o, body= %o', 
    req.params, req.body
  )

  let accountId     = req.params.accountId
  let transactionId = req.params.id

  // Verify accountId is a valid ObjectID
  if(!ObjectID.isValid(accountId)) {
    logger.error('Invalid account id=[%s]', accountId)
    return res.status(404).send({
      code:     404,
      message:  'Account not found',
    })
  }

  // Verify transactionId is a valid ObjectID
  if(!ObjectID.isValid(transactionId)) {
    logger.error('Invalid transaction id=[%s]', transactionId)
    return res.status(404).send({
      code:     404,
      message:  'Transaction not found',
    })
  }

  // Delete the transaction
  try {
    let user        = await currentUser()
    let transaction = await Transaction.findOneAndDelete({
      _id:        transactionId,
      accountId:  accountId
    })

    // Transaction does not exist in DB
    if(transaction == null) {
      logger.error(
        'Failed to delete transaction id=[%s] for account id=[%s], transaction= %o', 
        transactionId, accountId, transaction
      )
      return res.status(404).send({
        code:     404,
        message:  'Transaction not found'
      })
    }

    logger.info(
      'Deleted transaction id=[%s] for account id=[%s]', 
      transactionId, accountId
    )
    res.status(200).send({transaction})
  }
  catch(err) {
    logger.error(
      'Failed to delete transaction=[%s] for account=[%s], error= %o', 
      transactionId, accountId, err
    )
    res.status(400).send(err)
  }
})

// Export the transactions router
module.exports = router
