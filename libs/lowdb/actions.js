const fp = require('lodash/fp')

const cache = _require('libs/lowdb')
const logger = _require('libs/Logger')
const { normalizeRepos } = _require('libs/GitHub/webhooks/transformer')

const createInstallationOnCache = async (installation, repos) => {
  logger.verbose('Creating installation on lowdb Cache')

  try {
    let stuffedRepos = fp.keyBy('id')(normalizeRepos(repos, installation))

    let db = await cache()

    db
      .get('repositories')
      .extend(stuffedRepos)
      .write()

    return true
  } catch (err) {
    throw err
  }
}

const deleteInstallationFromCache = async (installation, repos) => {
  logger.verbose('Deleting installation from lowdb Cache')

  try {
    let db = await cache()

    let repoIDs = db
      .get('repositories')
      .filter({ installation_id: installation.id })
      .map('id')
      .value()

    repoIDs.forEach(repoId =>
      db
        .get('repositories')
        .unset(repoId)
        .write()
    )

    return true
  } catch (err) {
    throw err
  }
}

const addReposToCache = async (installation, repos) => {
  logger.verbose('Adding repositories to lowdb Cache')

  try {
    let stuffedRepos = fp.keyBy('id')(normalizeRepos(repos, installation))

    let db = await cache()

    db
      .get('repositories')
      .extend(stuffedRepos)
      .write()

    return true
  } catch (err) {
    throw err
  }
}

const removeReposFromCache = async (installation, repos) => {
  logger.verbose('Removing repositories from lowdb Cache')

  try {
    let repoIDs = fp.map('id')(repos)

    let db = await cache()

    repoIDs.forEach(repoID => {
      db
        .get('repositories')
        .unset(repoID)
        .write()
    })

    return true
  } catch (err) {
    throw err
  }
}

const fetchInstallationIdFromCache = async info => {
  logger.verbose('Fetching installation_id from lowdb Cache')

  try {
    let db = await cache()

    let id =
      db
        .get('repositories')
        .find({ owner: info.username })
        .get('installation_id')
        .value() || null

    return id
  } catch (err) {
    throw err
  }
}

const addRepoToCache = async repo => {
  logger.info('Adding repository to lowdb Cache')

  try {
    let db = await cache()

    db
      .get('repositories')
      .set(repo.id, repo)
      .write()

    return true
  } catch (err) {
    throw err
  }
}

module.exports = {
  createInstallationOnCache,
  deleteInstallationFromCache,
  addReposToCache,
  removeReposFromCache,
  fetchInstallationIdFromCache,
  addRepoToCache
}
