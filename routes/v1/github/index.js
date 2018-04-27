const router = require('express').Router()
const asyncHandler = require('express-async-handler')

const config = _require('configs/server')

const { webhooksHandler } = _require('libs/GitHub/webhooks')

const newEntryHandler = require('./new')

router.post('/webhook', asyncHandler(webhooksHandler))

router.use('/new', newEntryHandler)

module.exports = router
