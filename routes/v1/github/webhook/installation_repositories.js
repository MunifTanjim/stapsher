const { getInstallation, getRepositories } = _require(
  'libs/GitHub/helpers/payload'
)

const { addReposToCache, removeReposFromCache } = _require('libs/lowdb/helpers')

const { addReposToStore, removeReposFromStore } = _require(
  'libs/Firebase/helpers'
)

const handler = async payload => {
  let { action } = payload

  if (!['added', 'removed'].includes(action)) return

  let installation = getInstallation(payload)
  let repos = getRepositories(payload)

  try {
    switch (action) {
      case 'added':
        await addReposToCache(installation, repos)
        await addReposToStore(installation, repos)
        break
      case 'removed':
        await removeReposFromCache(installation, repos)
        await removeReposFromStore(installation, repos)
        break
    }

    return true
  } catch (err) {
    throw err
  }
}

module.exports = handler
