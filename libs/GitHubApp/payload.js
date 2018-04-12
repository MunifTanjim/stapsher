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

module.exports = {
  normalizeRepos,
  getInstallation,
  getRepositories
}
