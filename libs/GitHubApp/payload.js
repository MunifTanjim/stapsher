const getInstallationId = ({ installation: { id } }) => id

const extractInstallation = ({ installation: { id, account } }) => ({
  installation: {
    id,
    account: {
      id: account.id,
      login: account.login,
      type: account.type
    }
  }
})

const getReposAdded = ({ installation: { id }, repositories_added }) =>
  repositories_added.map(repository => ({
    ...repository,
    installation: id
  }))

const getReposRemoved = ({ repositories_removed }) =>
  repositories_removed.map(({ id }) => ({ id }))

const getAccount = ({ installation: { account } }) => ({
  id: account.id,
  login: account.login,
  type: account.type
})

const getInstallation = payload => ({
  id: getInstallationId(payload),
  account: { ...getAccount(payload) }
})

const getNormalizedInstallation

const getRepositories = ({ installation: { id }, repositories }) => ({
  repositories: repositories
})

const getInfo = payload => ({
  installation: { ...getInstallation(payload) },
  repositories: { ...getRepositories(payload) }
})

const getFlattenAccount = ({ installation: { id, account } }) => ({
  account: {
    id: account.id,
    login: account.login,
    type: account.type,
    installation: id
  }
})

const getFlattenInstallation = ({
  installation: { id, account },
  repositories
}) => ({
  installation: {
    id: id,
    account: account.id,
    repositories: repositories.map(repo => repo.id)
  }
})

const getFlattenRepositories = ({ installation: { id }, repositories }) => ({
  repositories: repositories.map(repository => ({
    ...repository,
    installation: id
  }))
})

const getFlattenInfo = payload => ({
  ...getFlattenAccount(payload),
  ...getFlattenInstallation(payload),
  ...getFlattenRepositories(payload)
})

module.exports = {
  getInstallation,
  getReposAdded,
  getReposRemoved
}
