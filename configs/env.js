const fs = require('fs')
const path = require('path')
const dotenvLoader = require('dotenv-expand')(require('dotenv'))

const dotenv = path.resolve('.env')

const NODE_ENV = process.env.NODE_ENV || 'development'

const dotenvFiles = [
  `${dotenv}.${NODE_ENV}.local`,
  `${dotenv}.${NODE_ENV}`,
  NODE_ENV !== 'test' && `${dotenv}.local`,
  dotenv
].filter(Boolean)

dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    dotenvLoader.config({
      path: dotenvFile
    })
  }
})

global._require = name => require(path.resolve(__dirname, '..', name))
