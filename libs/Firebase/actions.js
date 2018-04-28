const fp = require('lodash/fp')

const { store, fieldValue } = _require('libs/Firebase')

const { normalizeRepos } = _require('libs/GitHub/webhooks/transformer')

const { addRepoToCache } = _require('libs/lowdb/actions')

const logger = _require('libs/Logger')

const createInstallationOnStore = async (installation, repos) => {
  logger.verbose('Creating installation on FireStore')

  try {
    let repoIDs = fp.map('id')(repos)
    let stuffedRepos = fp.keyBy('id')(normalizeRepos(repos, installation))

    let batch = store.batch()

    let reposCollection = store.collection('repositories')

    repoIDs.forEach(repoID =>
      batch.set(reposCollection.doc(String(repoID)), stuffedRepos[repoID])
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

    let reposSnapshot = await store
      .collection('repositories')
      .where('installation_id', '==', installation.id)
      .get()

    reposSnapshot.forEach(repoDoc => batch.delete(repoDoc.ref))

    return batch.commit()
  } catch (err) {
    throw err
  }
}

const addReposToStore = async (installation, repos) => {
  logger.verbose('Adding repositories to FireStore')

  try {
    let repoIDs = fp.map('id')(repos)
    let stuffedRepos = fp.keyBy('id')(normalizeRepos(repos, installation))

    let batch = store.batch()

    let repositoriesCollection = store.collection('repositories')

    repoIDs.forEach(repoID =>
      batch.set(
        repositoriesCollection.doc(String(repoID)),
        stuffedRepos[repoID]
      )
    )

    return batch.commit()
  } catch (err) {
    throw err
  }
}

const removeReposFromStore = async (installation, repos) => {
  logger.verbose('Removing repositories from FireStore')

  try {
    let repoIDs = fp.map('id')(repos)

    let batch = store.batch()

    let repositoriesCollection = store.collection('repositories')

    repoIDs.forEach(repoID =>
      batch.delete(repositoriesCollection.doc(String(repoID)))
    )

    return batch.commit()
  } catch (err) {
    throw err
  }
}

const fetchInstallationIdFromStore = async info => {
  logger.verbose('Fetching installation_id from FireStore')

  try {
    let { docs } = await store
      .collection('repositories')
      .where('owner', '==', info.username)
      .get()

    let id = null

    if (docs.length) {
      let repo = docs[0].data()

      id = repo.installation_id

      addRepoToCache(repo).catch(err => {
        logger.error('addRepoToCache failure', err)
      })
    }

    return id
  } catch (err) {
    throw err
  }
}

module.exports = {
  createInstallationOnStore,
  deleteInstallationFromStore,
  addReposToStore,
  removeReposFromStore,
  fetchInstallationIdFromStore
}
