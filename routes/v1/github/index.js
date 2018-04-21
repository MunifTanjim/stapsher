const router = require('express').Router()

const config = _require('configs/server')

const { webhooksHandler } = _require('libs/GitHub/webhooks')

const asyncHandler = require('express-async-handler')

router.post('/webhook', asyncHandler(webhooksHandler))

// (req, res, next) => {
//   let respondError = message => res.status(400).send({ message })

//   let { method, headers, body: payload } = req

//   let id = headers['x-github-delivery']
//   if (!id) return respondError('MISSING_DELIVERY_ID')

//   let event = headers['x-github-event']
//   if (!event) return respondError('MISSING_EVENT')
//   let signature = headers['x-hub-signature'] || ''

//   if (webhookSecret && !signature)
//     return respondError('MISSING_PAYLOAD_SIGNATURE')

//   if (webhookSecret && !verifySignature(signature, payload, webhookSecret))
//     return respondError('ERROR_VERIFYING_PAYLOAD_SIGNATURE')

//   switch (event) {
//     case 'installation':
//       installationHandler(payload)
//       break
//     case 'installation_repositories':
//       installationRepositoriesHandler(payload)
//       break
//     default:
//       break
//   }

//   res.status(200).send({ sucess: true })
// }

module.exports = router
