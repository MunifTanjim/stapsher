const uuidv1 = require('uuid/v1')
const Github = _require('libs/GitHub')
// const clientConfig = _require('configs/client')

class ExtraStaticApp {
  constructor({ username, repository, branch }) {
    this.uid = uuidv1()

    this.github = new Github({
      username,
      repository,
      branch
    })
  }

  authenticate() {}

  getSiteConfig() {}

  setConfigPath(configPath) {
    this.configPath = configPath
      ? configPath
      : {
          file: 'extrastatic.yaml'
        }
  }
}

module.exports = ExtraStaticApp
