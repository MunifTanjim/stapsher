const { store } = require('../Firebase')
const cache = require('../lowdb')

const parseLinkHeader = require('parse-link-header')

const logger = require('../Logger')

const normalizeRepos = (repos, installation_id) =>
  repos.map(repo => ({
    ...repo,
    installation_id
  }))

const getInstallation = ({ installation: { id, account } }) => ({
  id,
  account: {
    id: account.id,
    login: account.login,
    type: account.type
  }
})

const getRepositories = payload => {
  let { action } = payload
  switch (action) {
    case 'created':
      return payload[`repositories`]
    case 'deleted':
      return []
    case 'added':
    case 'removed':
      return payload[`repositories_${action}`]
  }
}

const fetchInstallationIdFromStore = async ({ username, repository }) => {
  logger.verbose('Getting installation_id from FireStore')

  try {
    let { docs } = await store
      .collection('repositories')
      .where('full_name', '==', `${username}/${repository}`)
      .get()

    let id = docs.length ? docs[0].data().installation_id : null

    return id
  } catch (err) {
    throw err
  }
}
const fetchInstallationIdFromCache = async ({ username, repository }) => {
  logger.verbose('Getting installation_id from lowdb Cache')

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

const fetchInstallationIdFromGitHub = async ({ username }, authAsGithubApp) => {
  logger.verbose('Getting installation_id from GitHub API')

  try {
    let api = await authAsGithubApp()

    let page = 1,
      hasNext = true

    while (hasNext) {
      let { data, meta } = await api.apps.getInstallations({
        page
      })

      for ({ id, account } of data) {
        if (account.login === username) return id
      }

      if (meta.link) {
        let { next } = parseLinkHeader(meta.link)
        if (next) page = next.page
        else hasNext = false
      } else hasNext = false
    }

    return null
  } catch (err) {
    throw err
  }
}

const fetchInstallationId = async (info, authAsGithubApp) => {
  logger.verbose('Getting installation_id')

  let id

  try {
    id = await fetchInstallationIdFromCache(info)
    if (Boolean(id)) return id

    id = await fetchInstallationIdFromStore(info)
    if (Boolean(id)) return id

    id = await fetchInstallationIdFromGitHub(info, authAsGithubApp)
    if (Boolean(id)) return id

    throw new Error('APP_NOT_INSTALLED')
  } catch (err) {
    throw err
  }
}

module.exports.payload = {
  normalizeRepos,
  getInstallation,
  getRepositories
}

module.exports.app = {
  fetchInstallationId
}
