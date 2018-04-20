const config = require('../../../configs/server')

const OctokitWebhooks = require('@octokit/webhooks')

const webhookSecret = config.get('githubApp.webhookSecret')

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

const webhooks = new OctokitWebhooks({
  secret: webhookSecret,
  transform: async event => event
})

webhooks.on('*', async ({ id, name, payload }) => {
  console.log(name, 'event received')
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
    await webhooks.verifyAndReceive({
      id: req.headers['x-github-delivery'],
      name: req.headers['x-github-event'],
      payload: req.body,
      signature: req.headers['x-hub-signature']
    })

    res.send({ success: true })
  } catch (err) {
    throw err
  }
}

module.exports = {
  webhooksHandler
}
