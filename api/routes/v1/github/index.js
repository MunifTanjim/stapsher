const router = require('express').Router()

const { webhookHandler } = require('./webhook')

router.get('/auth', (req, res, next) => {
  res.send({ version: req.params.version })
})

router.post('/webhook', webhookHandler)

module.exports = router
