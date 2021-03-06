//-----------------------------------------------------------------------------
// server/routes/accounts.js
//-----------------------------------------------------------------------------
const express               = require('express')

const Account               = require('../models/account')
const Transaction           = require('../models/transaction')
const logger                = require('../config/winston')
const { 
  handleErrors,
  validateAndFindAccountId,
}                           = require('../utils/route-helpers')
const { DBModelIdError }    = require('../utils/custom-errors')
const { authenticateJwt }   = require('../utils/auth-helpers')
const { currentUser }       = require('../utils/current-user-helper')

// Get the Express Router
const router  = express.Router()

/**
 * GET /v1/accounts
 */ 
router.get('/v1/accounts', authenticateJwt, async (req, res) => {
  logger.info(`GET /api/v1/accounts`)

  try {
    const { user }  = req
    const accounts  = await Account.find({userId: user._id})

    logger.info('Retrieved [%d] accounts for user= %s', accounts.length, user._id)
    logger.debug('Accounts= %o', accounts)

    res.status(200).send({accounts})
  }
  catch(err) {
    logger.error(`Failed to find accounts for user=[${user._id}], err= %o`, err)
    res.status(404).send(err)
  }
})

/*
 * GET /v1/accounts/:id
 */
router.get('/v1/accounts/:id', authenticateJwt, async (req, res) => {
  logger.info('GET /api/v1/accounts/%s', req.params.id)
  const id = req.params.id

  try {
    let { user }  = req
    let account   = await validateAndFindAccountId(id)

    logger.info('Account for userId=[%s], account=[%s]', id, account)
    res.status(200).send({account})
  }
  catch(err) {
    logger.error('Failed to find account w/ userId=[%s], err=[%o]',id, err)
    if(err instanceof DBModelIdError) {
      return res.status(404).send(err)
    }
    res.status(400).send(err)
  }
})

/*
 * POST /v1/accounts
 */
router.post('/v1/accounts', authenticateJwt, async (req, res) => {
  logger.info('POST/api/v1/accounts, request body= %o', req.body)

  /**
   * Inner function to create a transaction to record the opening balance
   * when an account is created.
   * @param  {Account}     account - account model saved to mongodb.
   * @return {Transaction} Transaction for the opening balance.
   */
  async function createOpeningBalanceTransaction(account) {
    
    let transaction = new Transaction({
      date:         account.openingDate,
      description:  'Opening Balance',
      category:     'Balance',
      //* charge:       account.type === 'Credit Card' ? 'debit' : 'credit',
      amount:       account.openingBalance,
      accountId:    account._id,
      userId:       account.userId,
    })

    const  result = await transaction.save()
    return result
  }

  /**
   * Inner function to calculate the opening balance. The balance is negative for
   * credit cards and positive for bank accounts. If the balance is not specified
   * then it is 0.
   * @param {*} balance 
   */
  function getBalance() {
    if(!req.body.openingBalance) {
      return 0
    }
    else if(req.body.type === 'Credit Card') {
      return -1 * Math.abs(req.body.openingBalance)
    }
    else {
      return Math.abs(req.body.openingBalance)
    }
  }

  try {
    let { user }        = req
    let openingBalance  = getBalance()
    let openingDate     = req.body.openingDate ? new Date(req.body.openingDate) : new Date()

    // Create the account.
    let account = new Account({
      name:               req.body.name,
      userId:             user._id,
      financialInstitute: req.body.financialInstitute,
      type:               req.body.type    || 'Checking',
      openingBalance:     openingBalance,
      openingDate:        openingDate,
      balance:            openingBalance,         // Set balance to the openingBalance
      asOfDate:           openingDate,            // Set asOfDate to the openingDate
    })

    const result = await account.save() 
    logger.debug('Successfully created account=[%o]', result)

    const transaction = createOpeningBalanceTransaction(result)
    logger.debug('Successfully created initial balance transaction=[%o]', transaction)

    res.status(201).send(result)
  }
  catch(err) {
    logger.error('Failed to create account, err= %o', err)
    
    const errorResponse = handleErrors(err)
    res.status(errorResponse.status).send(errorResponse)
  }
})

/*
 * PUT /v1/accounts/:id
 */
router.put('/v1/accounts/:id', authenticateJwt, async (req, res) => {
  logger.info('PUT /api/v1/account/%s, request body= %o', req.params.id, req.body)
  
  let accountId = req.params.id

  try {
    let { user }  = req

    // Validate accountId
    await validateAndFindAccountId(accountId)

    let query   = { _id:  accountId }
    let update  = req.body
    let options = { new: true, runValidators: true }
    
    let result  = await Account.findOneAndUpdate(query, update, options) 

    logger.info('Updated account w/ id=[%s], doc=[%o]', accountId, result)
    res.status(200).send(result)
  }
  catch(err) {
    logger.error('Failed to update the account id=[%s], err= %o', accountId, err)

    const errorResponse = handleErrors(err)
    res.status(errorResponse.status).send(errorResponse)
  }
})

/*
 * DELETE /api/v1/accounts/:id
 */
router.delete('/v1/accounts/:id', authenticateJwt, async (req, res) => {
  logger.info('PUT /api/v1/account/%s, request= %o', req.params.id, req.body)
  
  let id = req.params.id

  try {
    let { user }  = req
    let doc       = await Account.findByIdAndRemove(id)

    if(doc == null) {
      logger.warn('Failed to find account w/ id=[%s]', id)
      return res.status(404).send({
        code: 404,
        msg:  'Account not found'
      })
    }

    logger.info('Deleted Account w/ id=[%s], doc= %o`', id, doc)
    res.status(200).send(doc)
  }
  catch(err) {
    logger.error('Failed to delete the account w/ id=[%s], err= %o', id, err)
    res.status(400).send(err)
  }
})

// Export the accounts router
module.exports = router