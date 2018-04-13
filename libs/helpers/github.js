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

    return Promise.resolve(id)
  } catch (err) {}
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

    return Promise.resolve(id)
  } catch (err) {}
}

const fetchInstallationIdFromGitHub = async ({ username }, api) => {
  logger.verbose('Getting installation_id from GitHub API')

  try {
    let page = 1,
      hasNext = true

    while (hasNext) {
      let { data, meta } = await api.apps.getInstallations({
        page
      })

      for ({ id, account } of data) {
        if (account.login === username) return Promise.resolve(id)
      }

      if (meta.link) {
        let { next } = parseLinkHeader(meta.link)
        if (next) page = next.page
        else hasNext = false
      } else hasNext = false
    }

    return Promise.resolve(null)
  } catch (err) {}
}

const fetchInstallationId = async (info, api) => {
  logger.verbose('Getting installation_id')

  let id

  try {
    id = await fetchInstallationIdFromCache(info)
    if (Boolean(id)) return Promise.resolve(id)

    id = await fetchInstallationIdFromStore(info)
    if (Boolean(id)) return Promise.resolve(id)

    id = await fetchInstallationIdFromGitHub(info, api)
    if (Boolean(id)) return Promise.resolve(id)

    return Promise.resolve(null)
  } catch (err) {
    return Promise.reject(err)
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
