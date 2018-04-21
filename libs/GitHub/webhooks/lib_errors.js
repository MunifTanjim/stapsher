const webhookErrorDict = {
  'Event name not passed': {
    code: 'MISSING_EVENT_NAME',
    statusCode: 422
  },
  'Event payload not passed': {
    code: 'MISSING_EVENT_PAYLOAD',
    statusCode: 422
  },
  'Webhook handler error': {
    code: 'WEBHOOK_HANDLER_ERROR',
    statusCode: 400
  },
  'signature does not match event payload and secret': {
    code: 'SIGNATURE_VERIFICATION_FAILED',
    statusCode: 422
  }
}

const webhookErrorInfo = ({ message }) =>
  webhookErrorDict[message] || {
    code: 'WEBHOOK_HANDLER_ERROR',
    statusCode: 400
  }

module.exports = { webhookErrorInfo }
