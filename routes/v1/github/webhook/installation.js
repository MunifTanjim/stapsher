const { getInstallation, getRepositories } = _require(
  'libs/GitHub/helpers/payload'
)

const { createInstallationOnCache, deleteInstallationFromCache } = _require(
  'libs/lowdb/helpers'
)

const { createInstallationOnStore, deleteInstallationFromStore } = _require(
  'libs/Firebase/helpers'
)

const handler = async payload => {
  let { action } = payload

  if (!['created', 'deleted'].includes(action)) return

  let installation = getInstallation(payload)
  let repos = getRepositories(payload)

  try {
    switch (action) {
      case 'created':
        await createInstallationOnCache(installation, repos)
        await createInstallationOnStore(installation, repos)
        break
      case 'deleted':
        await deleteInstallationOnCache(installation, repos)
        await deleteInstallationOnStore(installation, repos)
        break
    }

    return true
  } catch (err) {
    throw err
  }
}

module.exports = handler
