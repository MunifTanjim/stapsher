const isNull = require('lodash.isnull')
const parseLinkHeader = require('parse-link-header')

const cache = _require('libs/lowdb')
const logger = _require('libs/Logger')
const { ResponseError } = _require('libs/Error')
const { fetchInstallationIdFromStore } = _require('libs/Firebase/helpers')
const { fetchInstallationIdFromCache } = _require('libs/lowdb/helpers')

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
    if (!isNull(id)) return id

    id = await fetchInstallationIdFromStore(info)
    if (!isNull(id)) return id

    id = await fetchInstallationIdFromGitHub(info, authAsGithubApp)
    if (!isNull(id)) return id

    throw new ResponseError('GITHUB_APP_NOT_INSTALLED', 400)
  } catch (err) {
    throw err
  }
}

module.exports = {
  fetchInstallationId
}
