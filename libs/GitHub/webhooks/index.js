const config = require('../../../configs/server')

const OctokitWebhooks = require('@octokit/webhooks')

const logger = _require('libs/Logger')
const { throwError } = _require('libs/Error')

const {
  createInstallationOnCache,
  deleteInstallationFromCache,
  addReposToCache,
  removeReposFromCache
} = _require('libs/lowdb/actions')
const {
  createInstallationOnStore,
  deleteInstallationFromStore,
  addReposToStore,
  removeReposFromStore
} = _require('libs/Firebase/actions')

const transformer = require('./transformer')
const { errorInfo } = require('./errors')

const webhookSecret = config.get('githubApp.webhookSecret')

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
    await createInstallationOnCache(installation, repositories)
    await createInstallationOnStore(installation, repositories)
  }
)

webhooks.on(
  'installation.deleted',
  async ({ id, name, payload: { installation, repositories } }) => {
    await deleteInstallationFromCache(installation, repositories)
    await deleteInstallationFromStore(installation, repositories)
  }
)

webhooks.on(
  'installation_repositories.added',
  async ({ id, name, payload: { installation, repositories } }) => {
    await addReposToCache(installation, repositories)
    await addReposToStore(installation, repositories)
  }
)
webhooks.on(
  'installation_repositories.removed',
  async ({ id, name, payload: { installation, repositories } }) => {
    await removeReposFromCache(installation, repositories)
    await removeReposFromStore(installation, repositories)
  }
)

const webhooksHandler = async (req, res, next) => {
  try {
    let id = req.headers['x-github-delivery'],
      name = req.headers['x-github-event'],
      payload = req.body,
      signature = req.headers['x-hub-signature']

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

    throwError(code, err, statusCode, true)
  }
}

module.exports = {
  webhooksHandler
}
