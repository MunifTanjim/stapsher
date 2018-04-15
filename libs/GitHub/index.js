const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const OctokitREST = require('@octokit/rest')
const config = require('../../configs/server')

const { ResponseError } = _require('libs/Error')

const { fetchInstallationId } = require('./helpers/app')

class GitHub {
  constructor(info = {}) {
    this.info = info

    this.id = config.get('githubApp.id')

    this.api = OctokitREST({
      timeout: 5000,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'user-agent': 'extraStatic App agent'
      },
      baseUrl: 'https://api.github.com'
    })
  }

  async _getPrivateKey() {
    try {
      let privateKeyPath = path.resolve(config.get('githubApp.privateKey'))

      this.privateKey = await fs.readFile(privateKeyPath)

      return this.privateKey
    } catch (err) {
      throw err
    }
  }

  async _authAsApp() {
    try {
      let privateKey = await this._getPrivateKey()

      this.api.authenticate({
        type: 'integration',
        token: jwt.sign(
          {
            iat: Math.floor(new Date() / 1000), // issued at time
            exp: Math.floor(new Date() / 1000) + 60, // expiration time
            iss: this.id // integration's github id
          },
          privateKey,
          {
            algorithm: 'RS256'
          }
        )
      })

      return this.api
    } catch (err) {
      throw err
    }
  }

  async _getInstallationID() {
    try {
      this.installation_id = await fetchInstallationId(
        this.info,
        this._authAsApp
      )

      return this.installation_id
    } catch (err) {
      throw err
    }
  }

  async getInstallationToken() {
    try {
      let installation_id = await this._getInstallationID()

      let { data } = await this.api.apps.createInstallationToken({
        installation_id
      })

      this.installation_token = data

      return this.installation_token
    } catch (err) {
      throw err
    }
  }

  async authAsInstallation() {
    try {
      let { token } = await this.getInstallationToken()

      this.api.authenticate({
        type: 'token',
        token
      })

      return true
    } catch (err) {
      throw err
    }
  }

  async readFile(path) {
    try {
      let blob = await this.api.repos.getContent({
        user: this.info.username,
        repo: this.info.repository,
        ref: this.info.branch,
        path
      })

      let content = Buffer.from(blob.content, 'base64').toString()

      content = JSON.parse(content)

      return content
    } catch (err) {
      if (err instanceof SyntaxError)
        throw new ResponseError('SITE_CONFIG_PARSE_FAILED', 400, err)
      else throw err
    }
  }

  async writeFile(filePath, data, branch, commitTitle) {
    branch = branch || this.info.branch
    commitTitle = commitTitle || 'Add Staticman file'
    try {
      await this.api.repos.createFile({
        user: this.info.username,
        repo: this.info.repository,
        path: filePath,
        content: Buffer.from(data).toString('base64'),
        message: commitTitle,
        branch: branch
      })
    } catch (err) {
      throw err
    }
  }
}

// let github = new GitHub({
//   username: 'MunifTanjim',
//   repository: 'hugotest',
//   branch: 'extrastatic'
// })

// github
//   .getInstallationToken()
//   .then(data => {
//     console.log(data)
//   })
//   .catch(err => {
//     console.log(err)
//   })

module.exports = GitHub
