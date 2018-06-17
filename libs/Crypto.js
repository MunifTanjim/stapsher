const crypto = require('crypto')

const config = require('../configs/server')

const privateKey = config.get('rsaPrivateKey')

const hash = (string, algorithm, encoding = 'hex') => {
  try {
    let hashedString = crypto
      .createHash(algorithm)
      .update(string)
      .digest(encoding)

    return hashedString
  } catch (err) {
    throw err
  }
}

const encrypt = plainText => {
  try {
    let encryptedText = crypto
      .publicEncrypt(privateKey, Buffer.from(plainText))
      .toString('base64')

    return encryptedText
  } catch (err) {
    throw err
  }
}

const decrypt = encryptedText => {
  try {
    let decryptedText = crypto
      .privateDecrypt(privateKey, Buffer.from(encryptedText, 'base64'))
      .toString('utf8')

    return decryptedText
  } catch (err) {
    throw err
  }
}

module.exports = {
  encrypt,
  decrypt,
  hash
}
