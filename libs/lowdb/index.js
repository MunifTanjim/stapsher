const fs = require('fs')
const path = require('path')
const lowdb = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')

const config = require('../../configs/server')
const cachePath = path.resolve(config.get('cache.path'))

if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath)

const adapter = new FileAsync(`${cachePath}/cache.json`)

const cache = () =>
  lowdb(adapter).then(db => {
    db.defaults({ repositories: {} }).write()
    return db
  })

module.exports = cache
