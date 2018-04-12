const { normalizeRepos, getInstallation, getRepositories } = _require(
  'libs/GitHubApp/payload'
)

const _ = require('lodash')

const cache = _require('libs/lowdb')

const { store, fieldValue } = _require('libs/Firebase')

const updateFirebaseCache = async payload => {
  let { action } = payload

  if (!['created', 'deleted'].includes(action)) return

  let installation = getInstallation(payload)

  let repos = getRepositories(payload)

  let repoIds = _.map(repos, 'id')
  let flattenedRepos = _.keyBy(normalizeRepos(repos, installation.id), 'id')

  let batch = store.batch()

  let installationsCollection = store.collection('installations')
  let repositoriesCollection = store.collection('repositories')

  switch (action) {
    case 'created':
      batch.set(installationsCollection.doc(String(installation.id)), {
        installation,
        repositories: _.keyBy(repos, 'id')
      })

      repoIds.forEach(repoId => {
        batch.set(
          repositoriesCollection.doc(String(repoId)),
          flattenedRepos[repoId]
        )
      })
      break
    case 'deleted':
      batch.delete(installationsCollection.doc(String(installation.id)))
      let toDeleteReposSnapshot = await store
        .collection('repositories')
        .where('installation_id', '==', installation.id)
        .get()

      toDeleteReposSnapshot.forEach(repoDoc => {
        batch.delete(repoDoc.ref)
      })
      break
  }

  try {
    return await batch.commit()
  } catch (err) {
    console.log(err)
  }
}

const updateLocalCache = async payload => {
  let { action } = payload

  if (!['created', 'deleted'].includes(action)) return

  let installation = getInstallation(payload)

  let repos = getRepositories(payload)

  let repoIds = _.map(repos, 'id')
  let flattenedRepos = _.keyBy(normalizeRepos(repos, installation.id), 'id')

  try {
    let db = await cache()

    switch (action) {
      case 'created':
        db
          .set(`installations[${installation.id}]`, {
            installation,
            repositories: _.keyBy(repos, 'id')
          })
          .write()
        db
          .get('repositories')
          .extend(flattenedRepos)
          .write()
        break
      case 'deleted':
        let toDeleteRepoIds = db
          .get(`installations[${installation.id}].repositories`)
          .keys()
          .value()

        toDeleteRepoIds.forEach(repoId => {
          db
            .get('repositories')
            .unset(repoId)
            .write()
        })

        db
          .get(`installations`)
          .unset(installation.id)
          .write()

        break
    }
  } catch (err) {
    console.log(err)
  }
}

const handler = payload => {
  updateFirebaseCache(payload)
}

module.exports = handler
