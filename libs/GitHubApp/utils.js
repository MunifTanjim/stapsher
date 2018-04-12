const fs = require('fs')
const cache = _require('libs/lowdb')

const readInstallationFromCache = async () => {}
const readInstallationFromGitHub = async () => {}

const writeLocalCache = async payload => {
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

module.exports = {
  writeLocalCache
}
