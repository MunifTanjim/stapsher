const fs = require('fs')
const path = require('path')
const lowdb = require('lowdb')

const Memory = require('lowdb/adapters/Memory')
const FileSync = require('lowdb/adapters/FileSync')
const FileAsync = require('lowdb/adapters/FileAsync')

const { throwError } = require('../../libs/Error')

const config = require('../../configs/server')

const cachePath = path.resolve('cache')

if (!fs.existsSync(cachePath)) {
  fs.mkdirSync(cachePath)
}

const CacheAdapter = ['test'].includes(config.get('env')) ? Memory : FileAsync

const countsAdapter = new CacheAdapter(`${cachePath}/counts.json`)
const usersAdapter = new CacheAdapter(`${cachePath}/users.json`)

const getCountsCache = async () => {
  try {
    let countsCache = await lowdb(countsAdapter)

    return countsCache.defaults({ entries: 0 })
  } catch (err) {
    throw err
  }
}

const getUsersCache = async () => {
  try {
    return lowdb(usersAdapter)
  } catch (err) {
    throw err
  }
}

const getReposCache = async username => {
  try {
    if (!username) {
      throw new Error('[getReposCache] username required')
    }

    let usersCache = await getUsersCache()

    return usersCache.has(`${username}`).value()
      ? usersCache.get(`${username}.repos`)
      : usersCache.set(`${username}`, { repos: {} }).get(`${username}.repos`)
  } catch (err) {
    throw err
  }
}

module.exports.getCountsCache = getCountsCache
module.exports.getUsersCache = getUsersCache
module.exports.getReposCache = getReposCache

module.exports.adapters = {
  Memory,
  FileSync,
  FileAsync
}
