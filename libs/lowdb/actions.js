const fp = require('lodash/fp')

const { getCache, getReposCache } = require('../lowdb')
const logger = require('../Logger')
const { normalizeRepos } = require('../GitHub/webhooks/transformer')

const createInstallationOnCache = async (installation, repos) => {
  logger.verbose('Creating installation on lowdb Cache')

  try {
    let flattenedRepos = fp.keyBy('name')(normalizeRepos(repos, installation))

    let cache = await getReposCache(installation.account.login)

    cache.extend(flattenedRepos).write()

    return true
  } catch (err) {
    throw err
  }
}

const deleteInstallationFromCache = async (installation, repos) => {
  logger.verbose('Deleting installation from lowdb Cache')

  try {
    let cacheRoot = await getCache()

    cacheRoot
      .get('users')
      .unset(installation.account.login)
      .write()

    return true
  } catch (err) {
    throw err
  }
}

const addReposToCache = async (installation, repos) => {
  logger.verbose('Adding repositories to lowdb Cache')

  try {
    let flattenedRepos = fp.keyBy('name')(normalizeRepos(repos, installation))

    let db = await getReposCache(installation.account.login)

    db.extend(flattenedRepos).write()

    return true
  } catch (err) {
    throw err
  }
}

const removeReposFromCache = async (installation, repos) => {
  logger.verbose('Removing repositories from lowdb Cache')

  try {
    let repoNames = fp.map('name')(repos)

    let db = await getReposCache(installation.account.login)

    repoNames.forEach(repoName => db.unset(repoName).write())

    return true
  } catch (err) {
    throw err
  }
}

const fetchInstallationIdFromCache = async ({ username, repository }) => {
  logger.verbose('Fetching installation_id from lowdb Cache')

  try {
    let db = await getReposCache(username)

    let id =
      db
        .find({ full_name: `${username}/${repository}` })
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
    let db = await getReposCache(repo.owner)

    db.set(repo.name, repo).write()

    return true
  } catch (err) {
    logger.error('addRepoToCache failure', err)
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
