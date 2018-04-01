const fs = require('fs')
const path = require('path')
const lowdb = require('lowdb')

const Memory = require('lowdb/adapters/Memory')
const FileSync = require('lowdb/adapters/FileSync')
const FileAsync = require('lowdb/adapters/FileAsync')

const { throwError } = require('../../libs/Error')

const cachePath = path.resolve('cache')

if (!fs.existsSync(cachePath)) {
  fs.mkdirSync(cachePath)
}

const adapter = new FileAsync(`${cachePath}/cache.json`)

const getCache = async () => {
  try {
    let cacheRoot = await lowdb(adapter)

    return cacheRoot.defaults({ users: {} })
  } catch (err) {
    throw err
  }
}
const getReposCache = async username => {
  try {
    if (!username) {
      throwError('[getReposCache] username required', { username }, 500, true)
    }

    let cacheRoot = await getCache()

    return cacheRoot.has(`users.${username}`).value()
      ? cacheRoot.get(`users.${username}.repos`)
      : cacheRoot
          .set(`users.${username}`, { repos: {} })
          .get(`users.${username}.repos`)
  } catch (err) {
    throw err
  }
}

module.exports.getCache = getCache
module.exports.getReposCache = getReposCache

module.exports.adapters = {
  Memory,
  FileSync,
  FileAsync
}
