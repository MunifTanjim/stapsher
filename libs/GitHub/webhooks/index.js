const config = require('../../../configs/server')

const OctokitWebhooks = require('@octokit/webhooks')

const logger = require('../../Logger')
const { throwError } = require('../../Error')

const {
  createInstallationOnCache,
  deleteInstallationFromCache,
  addReposToCache,
  removeReposFromCache
} = require('../../lowdb/actions')
const {
  createInstallationOnStore,
  deleteInstallationFromStore,
  addReposToStore,
  removeReposFromStore
} = require('../../Firebase/actions')

const { transformer } = require('./transformer')
const { errorInfo } = require('./errors')

const webhookSecret = config.get('github.app.webhookSecret')

const webhooks = new OctokitWebhooks({
  secret: webhookSecret,
  transform: transformer
})

webhooks.on('*', async ({ id, name, payload }) => {
  logger.info(`GitHub Webhook received: ${name}`, { id, name })
})

webhooks.on(
  'installation.created',
  async ({ id, name, payload: { installation, repositories } }) => {
    await Promise.all([
      createInstallationOnCache(installation, repositories),
      createInstallationOnStore(installation, repositories)
    ])
  }
)

webhooks.on(
  'installation.deleted',
  async ({ id, name, payload: { installation, repositories } }) => {
    await Promise.all([
      deleteInstallationFromCache(installation, repositories),
      deleteInstallationFromStore(installation, repositories)
    ])
  }
)

webhooks.on(
  'installation_repositories.added',
  async ({ id, name, payload: { installation, repositories } }) => {
    await Promise.all([
      addReposToCache(installation, repositories),
      addReposToStore(installation, repositories)
    ])
  }
)
webhooks.on(
  'installation_repositories.removed',
  async ({ id, name, payload: { installation, repositories } }) => {
    await Promise.all([
      removeReposFromCache(installation, repositories),
      removeReposFromStore(installation, repositories)
    ])
  }
)

const webhooksHandler = async (req, res, next) => {
  try {
    let id = req.headers['x-github-delivery']
    let name = req.headers['x-github-event']
    let payload = req.body
    let signature = req.headers['x-hub-signature']

    await webhooks.verifyAndReceive({ id, name, payload, signature })

    res.send({ success: true })
  } catch (err) {
    if (err.event) delete err.event.payload

    if (err.errors)
      err.errors.forEach(error => {
        delete error.event.payload
        error.info = error.toString()
      })

    let { code, statusCode } = errorInfo(err)

    throwError(code, err, statusCode)
  }
}

module.exports = {
  webhooksHandler
}
