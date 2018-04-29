const fs = require('fs')
const path = require('path')
const lowdb = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')

const config = require('../../configs/server')
const cachePath = path.resolve(config.get('cache.path'))

const { throwError } = _require('libs/Error')

if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath)

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
    if (!username)
      throwError('[getReposCache] username required', { username }, 500)

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

module.exports = {
  getCache,
  getReposCache
}
