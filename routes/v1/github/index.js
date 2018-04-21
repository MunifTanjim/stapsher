const router = require('express').Router()
const asyncHandler = require('express-async-handler')

const config = _require('configs/server')

const { webhooksHandler } = _require('libs/GitHub/webhooks')

router.post('/webhook', asyncHandler(webhooksHandler))

module.exports = router
