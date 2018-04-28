const router = require('express').Router()
const asyncHandler = require('express-async-handler')

const config = _require('configs/server')

const { webhooksHandler } = _require('libs/GitHub/webhooks')

const actionsHandler = require('./actions')

router.post('/webhook', asyncHandler(webhooksHandler))

router.use('/:username/:repository/:branch/:entryType', actionsHandler)

module.exports = router
