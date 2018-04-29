const isNull = require('lodash.isnull')
const parseLinkHeader = require('parse-link-header')

const cache = _require('libs/lowdb')
const logger = _require('libs/Logger')
const { ResponseError } = _require('libs/Error')
const { fetchInstallationIdFromStore, addRepoToStore } = _require(
  'libs/Firebase/actions'
)
const { fetchInstallationIdFromCache } = _require('libs/lowdb/actions')

const fetchInstallationIdFromGitHub = async ({ username, repository }, api) => {
  logger.verbose('Fetching installation_id from GitHub API')

  try {
    let page = 1,
      hasNext = true

    while (hasNext) {
      let { data, meta } = await api.apps.getInstallations({
        page
      })

      for (let { id, account } of data) {
        if (account.login === username) {
          addRepoToStore({ username, repository }, { id, account }, api)

          return id
        }
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

const fetchInstallationId = async (info, api) => {
  logger.verbose('Fetching installation_id')

  try {
    let id

    id = await fetchInstallationIdFromCache(info)
    if (!isNull(id)) return id

    id = await fetchInstallationIdFromStore(info)
    if (!isNull(id)) return id

    id = await fetchInstallationIdFromGitHub(info, api)
    if (!isNull(id)) return id

    throw new ResponseError('GITHUB_APP_NOT_INSTALLED', 400, info)
  } catch (err) {
    throw err
  }
}

module.exports = {
  fetchInstallationId
}
