const config = require('../../../configs/server')

const OctokitWebhooks = require('@octokit/webhooks')

const logger = _require('libs/Logger')
const { respondError } = _require('libs/Error')

const { getInstallation, getRepositories } = _require(
  'libs/GitHub/helpers/payload'
)
const {
  createInstallationOnCache,
  deleteInstallationFromCache,
  addReposToCache,
  removeReposFromCache
} = _require('libs/lowdb/helpers')
const {
  createInstallationOnStore,
  deleteInstallationFromStore,
  addReposToStore,
  removeReposFromStore
} = _require('libs/Firebase/helpers')

const { webhookErrorInfo } = require('./lib_errors')

const webhookSecret = config.get('githubApp.webhookSecret')

const webhooks = new OctokitWebhooks({
  secret: webhookSecret,
  transform: async event => event
})

webhooks.on('*', async ({ id, name, payload }) => {
  logger.info(`GitHub Webhook received: ${name}`, { id, name })
})

webhooks.on('installation.created', async ({ id, name, payload }) => {
  let installation = getInstallation(payload)
  let repos = getRepositories(payload)

  await createInstallationOnCache(installation, repos)
  await createInstallationOnStore(installation, repos)
})

webhooks.on('installation.deleted', async ({ id, name, payload }) => {
  let installation = getInstallation(payload)
  let repos = getRepositories(payload)

  await deleteInstallationOnCache(installation, repos)
  await deleteInstallationOnStore(installation, repos)
})

webhooks.on(
  'installation_repositories.added',
  async ({ id, name, payload }) => {
    let installation = getInstallation(payload)
    let repos = getRepositories(payload)

    await addReposToCache(installation, repos)
    await addReposToStore(installation, repos)
  }
)
webhooks.on(
  'installation_repositories.removed',
  async ({ id, name, payload }) => {
    let installation = getInstallation(payload)
    let repos = getRepositories(payload)

    await removeReposFromCache(installation, repos)
    await removeReposFromStore(installation, repos)
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
    let { code, statusCode } = webhookErrorInfo(err)
    respondError(code, statusCode, err)
  }
}

module.exports = {
  webhooksHandler
}
