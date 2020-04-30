//-----------------------------------------------------------------------------
// server/routes/accounts.js
//-----------------------------------------------------------------------------
const express           = require('express')
const mongoose          = require('mongoose')
const { ObjectID }      = require('mongodb')

const Account           = require('../models/account')
const Transaction       = require('../models/transaction')
const logger            = require('../config/winston')
const { handleErrors }  = require('../utils/route-helpers')
const { currentUser }   = require('../utils/current-user-helper')

// Get the Express Router
const router  = express.Router()

/*
 * GET /v1/accounts
 */ 
router.get('/v1/accounts', async (req, res) => {
  logger.info(`GET /api/v1/accounts`)

  try {
    let user      = await currentUser()
    let accounts  = await Account.find({userId: user._id})

    logger.info('Retrieved accounts for user= %s', user._id)
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
router.get('/v1/accounts/:id', async (req, res) => {
  logger.info('GET /api/v1/accounts/%s', req.params.id)
  const id = req.params.id

  if(!ObjectID.isValid(id)) { 
    logger.error('Invalid Account Id=[%s]', id)
    return res.status(404).send({error: {code: 404, msg: 'Account not found'}}) 
  }

  try {
    let user    = await currentUser()
    let account = await Account.findById(id)

    if(account == null) {
      logger.error('Account not found for id=[%s]', id)
      return res.status(404).send( {error: {code: 404, msg: 'Account not found'}} )
    }

    logger.info('Account for userId=[%s], account=[%s]', id, account)
    res.status(200).send({account})
  }
  catch(err) {
    logger.error('Failed to find account w/ userId=[%s], err=[%o]',id, err)
    res.status(400).send(err)
  }
})

/*
 * POST /v1/accounts
 */
router.post('/v1/accounts', async (req, res) => {
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
    let user            = await currentUser()    // Simulate authentication
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
router.put('/v1/accounts/:id', async (req, res) => {
  logger.info('PUT /api/v1/account/%s, request body= %o', req.params.id, req.body)
  
  let accountId = req.params.id

  // Verify accountId is a valid ObjectID
  if(!ObjectID.isValid(accountId)) {
    logger.error('Invalid account id=[%s]', accountId)
    return res.status(404).send({
      code:     404,
      message:  'Account not found',
    })
  }

  try {
    let user    = await currentUser()    // Simulate authentication

    let query   = { _id:  accountId }
    let update  = req.body
    let options = { new: true, runValidators: true }
    
    let result  = await Account.findOneAndUpdate(query, update, options) 
    if(result == null) {
      logger.warn('Failed to find account w/ id=[%s]', accountId)
      return res.status(404).send({
        code:     404,
        message:  'Account not found'
      })
    }

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
router.delete('/v1/accounts/:id', async (req, res) => {
  logger.info('PUT /api/v1/account/%s, request= %o', req.params.id, req.body)
  
  let id = req.params.id

  try {
    let user  = await currentUser()
    let doc   = await Account.findByIdAndRemove(id)

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