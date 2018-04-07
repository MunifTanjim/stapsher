const config = _require('configs/server')
const { verifyGitHubPayload } = _require('libs/Crypto')
const installationHandler = require('./webhook/installation')
const installationRepositoriesHandler = require('./webhook/installation_repositories')

const githubWebhookSecret = config.get('githubApp.webhookSecret')

const webhookHandler = (req, res, next) => {
  let respondError = code => res.status(400).send({ status: 400, code: code })

  let { method, headers, body: payload } = req

  if (method !== 'POST') return next()

  let id = headers['x-github-delivery']
  if (!id) return respondError('MISSING_DELIVERY_ID')

  let event = headers['x-github-event']
  if (!event) return respondError('MISSING_EVENT')
  let signature = headers['x-hub-signature'] || ''
  if (githubWebhookSecret && !signature)
    return respondError('MISSING_PAYLOAD_SIGNATURE')

  if (githubWebhookSecret && !verifyGitHubPayload(payload, signature))
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
}

module.exports = {
  webhookHandler
}
