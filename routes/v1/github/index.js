const router = require('express').Router()
const asyncHandler = require('express-async-handler')

const config = _require('configs/server')

const { webhooksHandler } = _require('libs/GitHub/webhooks')

const { entryHandler } = require('./entry')

router.post('/webhook', asyncHandler(webhooksHandler))

router.use('/entry', entryHandler)

module.exports = router
