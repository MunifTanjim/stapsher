const crypto = require('crypto')
const bufferEq = require('buffer-equal-constant-time')

const config = _require('configs/server')

const privateKey = config.get('rsaPrivateKey')
const githubWebhookSecret = config.get('githubApp.webhookSecret')

const calculateGitHubPayloadSignature = githubPayload =>
  `sha1=${crypto
    .createHmac('sha1', githubWebhookSecret)
    .update(JSON.stringify(githubPayload))
    .digest('hex')}`

const verifyGitHubPayload = (githubPayload, receivedSignature) =>
  bufferEq(
    new Buffer(receivedSignature),
    new Buffer(calculateGitHubPayloadSignature(githubPayload))
  )

const encrypt = plainText => {
  try {
    let encryptedText = crypto
      .publicEncrypt(privateKey, new Buffer(plainText))
      .toString('base64')

    return encryptedText
  } catch (err) {
    return null
  }
}

const decrypt = encryptedText => {
  try {
    let decryptedText = crypto
      .privateDecrypt(privateKey, new Buffer(encryptedText, 'base64'))
      .toString('utf8')

    return decryptedText
  } catch (err) {
    return null
  }
}

module.exports = {
  encrypt,
  decrypt,
  verifyGitHubPayload
}
