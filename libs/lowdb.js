const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')

const path = require('path')
const config = require('../configs/server')
const cachePath = path.resolve(config.get('paths.cache'))

const adapter = new FileAsync(`${cachePath}/cache.json`)

const cache = () =>
  low(adapter).then(db => {
    db.defaults({ installations: {}, repositories: {} }).write()
    return db
  })

module.exports = cache
