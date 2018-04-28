const extractInstallation = ({ installation: { id, account } }) => ({
  id,
  account: {
    id: account.id,
    login: account.login,
    type: account.type
  }
})

const ping = async ({ id, name, payload }) => ({ id, name, payload })

const installation = async ({ id, name, payload }) => {
  let event = { id, name }

  event.payload = {
    action: payload.action,
    installation: extractInstallation(payload),
    repositories: payload.repositories || []
  }

  return event
}

const installation_repositories = async ({ id, name, payload }) => {
  let event = { id, name }

  event.payload = {
    action: payload.action,
    installation: extractInstallation(payload),
    repositories: payload[`repositories_${payload.action}`]
  }

  return event
}

const transformer = async event => {
  try {
    switch (event.name) {
      case 'ping':
        return ping(event)
      case 'installation':
        return installation(event)
      case 'installation_repositories':
        return installation_repositories(event)
      default:
        return event
    }
  } catch (err) {
    throw err
  }
}

const normalizeRepos = (repos, { id, account }) =>
  repos.map(repo => ({
    ...repo,
    installation_id: id,
    owner: account.login,
    owner_id: account.id
  }))

module.exports = {
  normalizeRepos,
  transformer
}
