const fs = require('fs')
const db = _require('libs/Firebase')
const cache = _require('libs/lowdb')

const { reposAdded, reposRemoved } = require('./payload').extract

const readInstallationFromCache = async () => {}
const readInstallationFromFirebase = async () => {}
const readInstallationFromGitHub = async () => {}

const writeFirebaseCache = async payload => {
  let installationInfo = getInfo(payload)
  let { repositories } = getFlattenRepositories(payload)

  try {
    let batch = db.batch()

    let installationsCollection = db.collection('installations')
    batch.set(
      installationsCollection.doc(String(installationInfo.installation.id)),
      installationInfo
    )

    let reposCollection = db.collection('repositories')
    repositories.forEach(repositoryInfo =>
      batch.set(reposCollection.doc(String(repositoryInfo.id)), repositoryInfo)
    )

    await batch.commit().then(() => console.log('Committed to Firebase'))
  } catch (err) {
    console.log(err)
  }
}

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
  writeFirebaseCache,
  writeLocalCache
}
