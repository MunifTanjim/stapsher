const path = require('path')
const { readFile } = require('fs')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const OctokitREST = require('@octokit/rest')

const config = require('../../configs/server')

const { respondError } = _require('libs/Error')

const { fetchInstallationId } = _require('libs/GitHub/actions')

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

      this.privateKey = await promisify(readFile)(privateKeyPath)

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
        this._authAsApp.bind(this)
      )

      return this.installation_id
    } catch (err) {
      throw err
    }
  }

  async _getInstallationToken() {
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
      let { token } = await this._getInstallationToken()

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
        respondError('CONFIG_PARSE_FAILED', 400, err)
      else throw err
    }
  }

  async writeFile(filePath, fileContent, commitMessage) {
    try {
      return await this.api.repos.createFile({
        owner: this.info.username,
        repo: this.info.repository,
        path: filePath,
        message: commitMessage,
        content: Buffer.from(fileContent).toString('base64'),
        branch: this.info.branch
      })
    } catch (err) {
      throw err
    }
  }
}

module.exports = GitHub
