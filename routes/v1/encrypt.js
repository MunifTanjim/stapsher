const router = require('express').Router()
const asyncHandler = require('express-async-handler')

const { encrypt } = require('../../libs/Crypto')

router.get(
  '/:string',
  asyncHandler(async (req, res, next) => {
    try {
      let { string } = req.params
      let encryptedString = encrypt(string)

      res.type('txt').send(encryptedString)
    } catch (err) {
      throw err
    }
  })
)

module.exports = router
