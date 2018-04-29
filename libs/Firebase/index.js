const path = require('path')
const admin = require('firebase-admin')

const config = require('../../configs/server')

const serviceAccount = _require(config.get('firebase.serviceAccount'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const store = admin.firestore()

const fieldValue = admin.firestore.FieldValue

const getUsersCollection = () => store.collection('users')
const getUserDoc = username => getUsersCollection().doc(username)
const getReposCollection = username => getUserDoc(username).collection('repos')
const getRepoDoc = (username, repo) => getReposCollection(username).doc(repo)

module.exports = {
  store,
  fieldValue,
  getUsersCollection,
  getUserDoc,
  getReposCollection,
  getRepoDoc
}
