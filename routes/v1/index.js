const router = require('express').Router()
const asyncHandler = require('express-async-handler')

const homeRouter = require('./home')
const encryptRouter = require('./encrypt')
const tasksRouter = require('./tasks')
const { webhooksHandler } = _require('libs/GitHub/webhooks')

router.param('platform', (req, res, next, platform) => {
  let defaultAPIHosts = {
    github: 'api.github.com',
    gitlab: 'gitlab.com'
  }

  let url = req.query.api || defaultAPIHosts[platform]

  req.params.platformAPIHost = /^https?:\/\//.test(url) ? url : `https://${url}`

  next()
})

router.use('/', homeRouter)
router.use('/encrypt', encryptRouter)
router.use('/:platform/:username/:repository/:branch/:entryType', tasksRouter)

router.post('/github/webhook', asyncHandler(webhooksHandler))

module.exports = router
