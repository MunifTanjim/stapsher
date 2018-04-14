const _ = require('lodash')

const cache = require('../lowdb')

const { normalizeRepos } = _require('libs/GitHub/helpers/payload')

const logger = _require('libs/Logger')

const createInstallationOnCache = async (installation, repos) => {
  let flattenedRepos = _.keyBy(normalizeRepos(repos, installation.id), 'id')

  try {
    let db = await cache()

    db
      .set(`installations[${installation.id}]`, {
        installation,
        repositories: _.keyBy(repos, 'id')
      })
      .write()

    db
      .get('repositories')
      .extend(flattenedRepos)
      .write()

    return true
  } catch (err) {
    throw err
  }
}

const deleteInstallationFromCache = async (installation, repos) => {
  try {
    let db = await cache()

    let repoIds = db
      .get(`installations[${installation.id}].repositories`)
      .keys()
      .value()

    repoIds.forEach(repoId => {
      db
        .get('repositories')
        .unset(repoId)
        .write()
    })

    db
      .get(`installations`)
      .unset(installation.id)
      .write()

    return true
  } catch (err) {
    throw err
  }
}

const addReposToCache = async (installation, repos) => {
  try {
    let db = await cache()

    db
      .get(`installations[${installation.id}].repositories`)
      .extend(_.keyBy(repos, 'id'))
      .write()

    db
      .get('repositories')
      .extend(_.keyBy(normalizeRepos(repos, installation.id), 'id'))
      .write()

    return true
  } catch (err) {
    throw err
  }
}

const removeReposFromCache = async (installation, repos) => {
  let repoIDs = _.map(repos, 'id')

  try {
    let db = await cache()

    repoIDs.forEach(repoID => {
      db
        .get(`installations[${installation.id}].repositories`)
        .unset(repoID)
        .write()

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

const fetchInstallationIdFromCache = async ({ username, repository }) => {
  logger.verbose('Fetching installation_id from lowdb Cache')

  try {
    let db = await cache()

    let id =
      db
        .get('repositories')
        .find({ full_name: `${username}/${repository}` })
        .get('installation_id')
        .value() || null

    return id
  } catch (err) {
    throw err
  }
}

module.exports = {
  createInstallationOnCache,
  deleteInstallationFromCache,
  addReposToCache,
  removeReposFromCache,
  fetchInstallationIdFromCache
}
