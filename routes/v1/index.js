const router = require('express').Router()
const asyncHandler = require('express-async-handler')

const homeRouter = require('./home')
const encryptRouter = require('./encrypt')
const tasksRouter = require('./tasks')
const { webhooksHandler } = require('../../libs/GitHub/webhooks')

const baseUrlMap = {
  github: 'api.github.com',
  gitlab: 'gitlab.com'
}

router.param('platform', (req, res, next, platform) => {
  let url = req.query.baseurl || baseUrlMap[platform]

  req.params.platformBaseUrl = /^https?:\/\//.test(url) ? url : `https://${url}`

  next()
})

router.use('/', homeRouter)
router.use('/encrypt', encryptRouter)
router.use('/:platform/:username/:repository/:branch/:entryType', tasksRouter)

router.post('/github/webhook', asyncHandler(webhooksHandler))

module.exports = router
