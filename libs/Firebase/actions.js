const _ = require('lodash')

const { store, fieldValue } = require('../Firebase')

const { normalizeRepos } = require('../../libs/GitHub/webhooks/transformer')

const logger = require('../../libs/Logger')

const { addRepoToCache } = require('../../libs/lowdb/actions')

const createInstallationOnStore = async (installation, repos) => {
  logger.verbose('Creating installation on FireStore')

  let repoIDs = _.map(repos, 'id')
  let flattenedRepos = _.keyBy(normalizeRepos(repos, installation.id), 'id')

  try {
    let batch = store.batch()

    batch.set(store.collection('installations').doc(String(installation.id)), {
      installation,
      repositories: _.keyBy(repos, 'id')
    })

    let reposCollection = store.collection('repositories')

    repoIDs.forEach(repoID => {
      batch.set(reposCollection.doc(String(repoID)), flattenedRepos[repoID])
    })

    return await batch.commit()
  } catch (err) {
    throw err
  }
}

const deleteInstallationFromStore = async (installation, repos) => {
  logger.verbose('Deleting installation from FireStore')

  try {
    let batch = store.batch()

    batch.delete(store.collection('installations').doc(String(installation.id)))

    let reposSnapshot = await store
      .collection('repositories')
      .where('installation_id', '==', installation.id)
      .get()

    reposSnapshot.forEach(repoDoc => {
      batch.delete(repoDoc.ref)
    })

    return await batch.commit()
  } catch (err) {
    throw err
  }
}

const addReposToStore = async (installation, repos) => {
  logger.verbose('Adding repositories to FireStore')

  let repoIDs = _.map(repos, 'id')
  let flattenedRepos = _.keyBy(normalizeRepos(repos, installation.id), 'id')

  try {
    let batch = store.batch()

    batch.set(
      store.collection('installations').doc(String(installation.id)),
      {
        repositories: _.keyBy(repos, 'id')
      },
      { merge: true }
    )

    let repositoriesCollection = store.collection('repositories')

    repoIDs.forEach(repoID => {
      batch.set(
        repositoriesCollection.doc(String(repoID)),
        flattenedRepos[repoID]
      )
    })

    return await batch.commit()
  } catch (err) {
    throw err
  }
}

const removeReposFromStore = async (installation, repos) => {
  logger.verbose('Removing repositories from FireStore')

  let repoIDs = _.map(repos, 'id')

  try {
    let batch = store.batch()

    batch.update(
      store.collection('installations').doc(String(installation.id)),
      _.assign(
        {},
        ...repoIDs.map(repoID => ({
          [`repositories.${repoID}`]: fieldValue.delete()
        }))
      )
    )

    let repositoriesCollection = store.collection('repositories')

    repoIDs.forEach(repoID => {
      batch.delete(repositoriesCollection.doc(String(repoID)))
    })

    return await batch.commit()
  } catch (err) {
    throw err
  }
}

const fetchInstallationIdFromStore = async ({ username, repository }) => {
  logger.verbose('Fetching installation_id from FireStore')

  try {
    let { docs } = await store
      .collection('repositories')
      .where('full_name', '==', `${username}/${repository}`)
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
