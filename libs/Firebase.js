const path = require('path')
const admin = require('firebase-admin')

const config = _require('configs/server')
const serviceAccount = _require(config.get('firebase.serviceAccount'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

module.exports = db
