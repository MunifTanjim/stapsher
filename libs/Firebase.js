const path = require('path')
const admin = require('firebase-admin')

const config = require('../configs/server')

const serviceAccount = _require(config.get('firebase.serviceAccount'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const store = admin.firestore()

const fieldValue = admin.firestore.FieldValue

module.exports = {
  store,
  fieldValue
}
