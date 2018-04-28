const router = require('express').Router()
const asyncHandler = require('express-async-handler')

const { encrypt } = require('../../libs/Crypto')
const { throwError } = require('../../libs/Error')

router.get('/:text', (req, res, next) => {
  try {
    let { text } = req.params
    let encryptedText = encrypt(text)

    res.send(encryptedText)
  } catch (err) {
    throw err
  }
})

module.exports = router
