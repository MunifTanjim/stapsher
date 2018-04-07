const { getInstallation, getReposAdded, getReposRemoved } = _require(
  'libs/GitHubApp/utils'
)

const writeLocalCache = async payload => {
  let { action } = payload

  let installation = getInstallation(payload)

  let { repository_selection } = payload

  let reposAdded = action === 'added' ? getReposAdded(payload) : []
  let reposRemoved = action === 'removed' ? getReposRemoved(payload) : []

  let { account, installation, repositories } = getFlattenInfo(payload)

  try {
    let db = await cache()

    db
      .get('installations')
      .set(installation.id, installation)
      .write()

    db
      .get('accounts')
      .set(account.id, account)
      .write()

    db
      .get('repositories')
      .extend(...repositories.map(repo => ({ [repo.id]: repo })))
      .write()
  } catch (err) {
    console.log(err)
  }
}

const handler = payload => {
  console.log(payload)
}

module.exports = handler
