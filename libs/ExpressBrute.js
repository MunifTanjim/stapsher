const ExpressBrute = require('express-brute')
const LowdbStore = require('express-brute-lowdb')

const { FileSync, Memory } = require('./lowdb').adapters

const { bruteStoreErrorHandler } = require('./Error/handlers')
const httpCodes = require('./Error/httpcodes')

const config = require('../configs/server')

const store = new LowdbStore({
  adapter: ['test'].includes(config.get('env')) ? Memory : FileSync,
  adapterArgs: ['cache/brute.json'],
  rootKey: 'brute'
})

const bruteforce = new ExpressBrute(store, {
  minWait: 5 * 1000,
  maxWait: 60 * 1000,
  lifetime: 60,
  handleStoreError: bruteStoreErrorHandler
})

const getSecondsUntilNextRequest = nextValidRequestDate =>
  Math.ceil((nextValidRequestDate.getTime() - Date.now()) / 1000)

const failCallbackHandler = (req, res, next, nextValidRequestDate) => {
  let secondsUntilNextRequest = getSecondsUntilNextRequest(nextValidRequestDate)

  res.set('Retry-After', secondsUntilNextRequest)
  res.status(429).send({
    code: httpCodes[429],
    info: {
      message: `Too many requests received in a short amount of time! Retry after ${secondsUntilNextRequest} seconds.`,
      retryAfter: secondsUntilNextRequest * 1000
    }
  })
}

const bruteMiddleware = () => {
  return bruteforce.getMiddleware({
    failCallback: failCallbackHandler
  })
}

module.exports = {
  bruteMiddleware
}
