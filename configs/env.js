const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const dotenvLoader = require('dotenv-expand')(dotenv)

const NODE_ENV = process.env.NODE_ENV || 'development'

const dotenvPath = path.resolve('.env')

const dotenvFiles = [`${dotenvPath}.${NODE_ENV}`, dotenvPath].filter(Boolean)

dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    dotenvLoader.config({ path: dotenvFile })
  }
})

global.NODE_ENV = NODE_ENV
