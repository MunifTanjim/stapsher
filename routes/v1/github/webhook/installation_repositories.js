const { normalizeRepos, getInstallation, getRepositories } = _require(
  'libs/helpers/github'
).payload

const _ = require('lodash')

const cache = _require('libs/lowdb')

const { store, fieldValue } = _require('libs/Firebase')

const updateFirebaseCache = async payload => {
  let { action } = payload

  if (!['added', 'removed'].includes(action)) return

  let installation = getInstallation(payload)

  let repos = getRepositories(payload)

  let repoIds = _.map(repos, 'id')
  let flattenedRepos = _.keyBy(normalizeRepos(repos, installation.id), 'id')

  let batch = store.batch()

  let installationsCollection = store.collection('installations')
  let repositoriesCollection = store.collection('repositories')

  switch (action) {
    case 'added':
      batch.set(
        installationsCollection.doc(String(installation.id)),
        {
          repositories: _.keyBy(repos, 'id')
        },
        { merge: true }
      )
      repoIds.forEach(repoId => {
        batch.set(
          repositoriesCollection.doc(String(repoId)),
          flattenedRepos[repoId]
        )
      })
      break
    case 'removed':
      batch.update(
        installationsCollection.doc(String(installation.id)),
        _.assign(
          {},
          ...repoIds.map(repoId => ({
            [`repositories.${repoId}`]: fieldValue.delete()
          }))
        )
      )

      repoIds.forEach(repoId => {
        batch.delete(repositoriesCollection.doc(String(repoId)))
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

  if (!['added', 'removed'].includes(action)) return

  let installation = getInstallation(payload)

  let repos = getRepositories(payload)

  let repoIds = _.map(repos, 'id')

  try {
    let db = await cache()

    switch (action) {
      case 'added':
        db
          .get(`installations[${installation.id}].repositories`)
          .extend(_.keyBy(repos, 'id'))
          .write()
        db
          .get('repositories')
          .extend(_.keyBy(normalizeRepos(repos, installation.id), 'id'))
          .write()
        break
      case 'removed':
        repoIds.forEach(repoId => {
          db
            .get(`installations[${installation.id}].repositories`)
            .unset(repoId)
            .write()
          db
            .get('repositories')
            .unset(repoId)
            .write()
        })
        break
    }
  } catch (err) {
    console.log(err)
  }
}

const handler = payload => {
  updateLocalCache(payload)
  updateFirebaseCache(payload)
}

module.exports = handler
