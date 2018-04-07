const uuidv1 = require('uuid/v1')
const Github = require('./Github')
const clientConfig = require('../configs/client')

class ExtraStaticApp {
  constructor({ username, repository, branch }) {
    this.uid = uuidv1()
    this.github = new Github({ username, repository, branch })
  }

  getSiteConfig()

  setCofigPath(configPath) {
    this.configPath = configPath
      ? configPath
      : {
          file: 'extrastatic.yaml'
        }
  }
}

module.exports = ExtraStaticApp
