const fp = require('lodash/fp')

const { getCountsCache, getUsersCache, getReposCache } = require('../lowdb')
const logger = require('../Logger')
const { normalizeRepos } = require('../SCM/GitHub/webhooks/transformer')

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
    let usersCache = await getUsersCache()

    usersCache.unset(installation.account.login).write()

    return true
  } catch (err) {
    throw err
  }
}

const addReposToCache = async (installation, repos) => {
  logger.verbose('Adding repositories to lowdb Cache')

  try {
    let flattenedRepos = fp.keyBy('name')(normalizeRepos(repos, installation))

    let cache = await getReposCache(installation.account.login)

    cache.extend(flattenedRepos).write()

    return true
  } catch (err) {
    throw err
  }
}

const removeReposFromCache = async (installation, repos) => {
  logger.verbose('Removing repositories from lowdb Cache')

  try {
    let repoNames = fp.map('name')(repos)

    let cache = await getReposCache(installation.account.login)

    repoNames.forEach(repoName => cache.unset(repoName).write())

    return true
  } catch (err) {
    throw err
  }
}

const fetchInstallationIdFromCache = async ({ username, repository }) => {
  logger.verbose('Fetching installation_id from lowdb Cache')

  try {
    let cache = await getReposCache(username)

    let id =
      cache
        .find({ full_name: `${username}/${repository}` })
        .get('installation_id')
        .value() || null

    return id
  } catch (err) {
    throw err
  }
}

const addRepoToCache = async repo => {
  logger.verbose('Adding repository to lowdb Cache')

  try {
    let cache = await getReposCache(repo.owner)

    cache.set(repo.name, repo).write()

    return true
  } catch (err) {
    logger.error('addRepoToCache failure', err)
  }
}

const incrementEntryCountCache = async () => {
  try {
    let cache = await getCountsCache()

    let curr = cache.get('entries').value()

    cache.set('entries', curr + 1).write()

    return curr + 1
  } catch (err) {
    logger.error('incrementEntryCountCache failure', err)
  }
}

module.exports = {
  createInstallationOnCache,
  deleteInstallationFromCache,
  addReposToCache,
  removeReposFromCache,
  fetchInstallationIdFromCache,
  addRepoToCache,
  incrementEntryCountCache
}
