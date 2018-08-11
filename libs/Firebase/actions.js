const fp = require('lodash/fp')

const {
  store,
  getUserDoc,
  getReposCollection,
  getRepoDoc
} = require('../Firebase')

const { normalizeRepos } = require('../SCM/GitHub/webhooks/transformer')

const { addRepoToCache } = require('../lowdb/actions')

const logger = require('../Logger')

const createInstallationOnStore = async (installation, repos) => {
  logger.verbose('Creating installation on FireStore')

  try {
    let repoNames = fp.map('name')(repos)
    let flattenedRepos = fp.keyBy('name')(normalizeRepos(repos, installation))

    let batch = store.batch()

    let reposCollection = getReposCollection(installation.account.login)

    repoNames.forEach(repoName =>
      batch.set(reposCollection.doc(repoName), flattenedRepos[repoName])
    )

    return batch.commit()
  } catch (err) {
    throw err
  }
}

const deleteInstallationFromStore = async (installation, repos) => {
  logger.verbose('Deleting installation from FireStore')

  try {
    let batch = store.batch()

    let userDoc = getUserDoc(installation.account.login)
    let reposCollection = getReposCollection(installation.account.login)

    let reposSnapshot = await reposCollection.get()
    reposSnapshot.forEach(repoDoc => batch.delete(repoDoc.ref))

    batch.delete(userDoc)

    return batch.commit()
  } catch (err) {
    throw err
  }
}

const addReposToStore = async (installation, repos) => {
  logger.verbose('Adding repositories to FireStore')

  try {
    let repoNames = fp.map('name')(repos)
    let flattenedRepos = fp.keyBy('name')(normalizeRepos(repos, installation))

    let batch = store.batch()

    let reposCollection = getReposCollection(installation.account.login)

    repoNames.forEach(repoName =>
      batch.set(reposCollection.doc(repoName), flattenedRepos[repoName])
    )

    return batch.commit()
  } catch (err) {
    throw err
  }
}

const removeReposFromStore = async (installation, repos) => {
  logger.verbose('Removing repositories from FireStore')

  try {
    let repoNames = fp.map('name')(repos)

    let batch = store.batch()

    let reposCollection = getReposCollection(installation.account.login)

    repoNames.forEach(repoName => batch.delete(reposCollection.doc(repoName)))

    return batch.commit()
  } catch (err) {
    throw err
  }
}

const fetchInstallationIdFromStore = async ({ username, repository }) => {
  logger.verbose('Fetching installation_id from FireStore')

  try {
    let repoDoc = getRepoDoc(username, repository)

    let repoDocSnapshot = await repoDoc.get()

    let repo = repoDocSnapshot.data()

    if (repo) addRepoToCache(repo)

    let id = repo ? repo.installation_id : null

    return id
  } catch (err) {
    throw err
  }
}

const addRepoToStore = async ({ username, repository }, installation, api) => {
  logger.info('Adding repository to FireStore')

  try {
    let repoObject = {
      name: repository,
      full_name: `${username}/${repository}`
    }

    let [repo] = normalizeRepos([repoObject], installation)

    let reposCollection = getReposCollection(username)

    await reposCollection.doc(repository).set(repo)

    addRepoToCache(repo)

    return true
  } catch (err) {
    logger.error('addRepoToStore failure', err)
  }
}

module.exports = {
  createInstallationOnStore,
  deleteInstallationFromStore,
  addReposToStore,
  removeReposFromStore,
  fetchInstallationIdFromStore,
  addRepoToStore
}
