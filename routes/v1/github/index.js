const router = require('express').Router()

const { webhookHandler } = require('./webhook')

router.post('/webhook', webhookHandler)

module.exports = router
