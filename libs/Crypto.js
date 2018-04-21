const crypto = require('crypto')

const config = require('../configs/server')

const privateKey = config.get('rsaPrivateKey')

const encrypt = plainText => {
  try {
    let encryptedText = crypto
      .publicEncrypt(privateKey, Buffer.from(plainText))
      .toString('base64')

    return encryptedText
  } catch (err) {
    return null
  }
}

const decrypt = encryptedText => {
  try {
    let decryptedText = crypto
      .privateDecrypt(privateKey, Buffer.from(encryptedText, 'base64'))
      .toString('utf8')

    return decryptedText
  } catch (err) {
    return null
  }
}

module.exports = {
  encrypt,
  decrypt
}
