const router = require('express').Router()

const config = _require('configs/server')

const { verifySignature } = _require('libs/Crypto')

const installationHandler = require('./webhook/installation')

const installationRepositoriesHandler = require('./webhook/installation_repositories')

const webhookSecret = config.get('githubApp.webhookSecret')

router.post('/webhook', (req, res, next) => {
  let respondError = code => res.status(400).send({ status: 400, code: code })

  let { method, headers, body: payload } = req

  if (method !== 'POST') return next()

  let id = headers['x-github-delivery']
  if (!id) return respondError('MISSING_DELIVERY_ID')

  let event = headers['x-github-event']
  if (!event) return respondError('MISSING_EVENT')
  let signature = headers['x-hub-signature'] || ''

  if (webhookSecret && !signature)
    return respondError('MISSING_PAYLOAD_SIGNATURE')

  if (
    webhookSecret &&
    !verifySignature(signature, JSON.stringify(payload), webhookSecret)
  )
    return respondError('ERROR_VERIFYING_PAYLOAD_SIGNATURE')

  switch (event) {
    case 'installation':
      installationHandler(payload)
      break
    case 'installation_repositories':
      installationRepositoriesHandler(payload)
      break
    default:
      break
  }

  res.status(200).send({ sucess: true })
})

module.exports = router
