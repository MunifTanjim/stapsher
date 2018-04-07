const { writeFirebaseCache, writeLocalCache } = require('./utils')

const handler = payload => {
  writeFirebaseCache(payload)
  writeLocalCache(payload)
}

module.exports = handler
