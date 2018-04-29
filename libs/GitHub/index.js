const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const OctokitREST = require('@octokit/rest')

const yaml = require('js-yaml')

const config = require('../../configs/server')

const { throwError } = _require('libs/Error')
const { fetchInstallationId } = _require('libs/GitHub/actions')

const privateKey = fs.readFileSync(
  path.resolve(config.get('githubApp.privateKey'))
)

class GitHub {
  constructor(info = {}) {
    this.info = info

    this.id = config.get('githubApp.id')

    this.api = OctokitREST({
      timeout: 5000,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'user-agent': 'Stapsher agent'
      },
      baseUrl: 'https://api.github.com'
    })

    this.privateKey = privateKey

    this.authedAsApp = false
    this.authedAsInstallation = false

    this.installation_id = null
    this.installation_token = null
  }

  async _authAsApp() {
    try {
      if (this.authedAsApp) return true

      this.api.authenticate({
        type: 'integration',
        token: jwt.sign(
          {
            iat: Math.floor(new Date() / 1000), // issued at time
            exp: Math.floor(new Date() / 1000) + 60, // expiration time
            iss: this.id // integration's github id
          },
          this.privateKey,
          {
            algorithm: 'RS256'
          }
        )
      })

      this.authedAsApp = true

      return this.authedAsApp
    } catch (err) {
      throw err
    }
  }

  async _getInstallationID() {
    try {
      this.installation_id = await fetchInstallationId(this.info, this.api)

      return this.installation_id
    } catch (err) {
      throw err
    }
  }

  async _getInstallationToken() {
    try {
      await this._authAsApp()

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
      if (this.authedAsInstallation) return true

      let { token } = await this._getInstallationToken()

      this.api.authenticate({
        type: 'token',
        token
      })

      this.authedAsInstallation = true

      return this.authedAsInstallation
    } catch (err) {
      throw err
    }
  }

  async readFile(path) {
    try {
      let extension = path.split('.').pop()

      let { data } = await this.api.repos.getContent({
        owner: this.info.username,
        repo: this.info.repository,
        ref: this.info.branch,
        path
      })

      let blob = Buffer.from(data.content, 'base64').toString()

      let content

      switch (extension.toLowerCase()) {
        case 'json':
          content = JSON.parse(blob)
          break
        case 'yaml':
        case 'yml':
          content = yaml.safeLoad(blob, 'utf8')
          break
        default:
          throwError('UNSUPPORTED_EXTENSION', { extension }, 422, true)
      }

      return content
    } catch (err) {
      if (err instanceof SyntaxError)
        throwError('FILE_PARSE_FAILED', err, 422, true)
      else throw err
    }
  }

  async writeFile(path, commitMessage, content, branch = this.info.branch) {
    try {
      let { data } = this.api.repos.createFile({
        owner: this.info.username,
        repo: this.info.repository,
        path,
        message: commitMessage,
        content: Buffer.from(content).toString('base64'),
        branch
      })

      return data
    } catch (err) {
      throw err
    }
  }

  async writeFileAndCreatePR(path, commitMessage, content, branch, body = '') {
    try {
      let { data: branchData } = await this.api.repos.getBranch({
        owner: this.info.username,
        repo: this.info.repository,
        branch: this.info.branch
      })

      await this.api.gitdata.createReference({
        owner: this.info.username,
        repo: this.info.repository,
        ref: `refs/heads/${branch}`,
        sha: branchData.commit.sha
      })

      await this.writeFile(path, commitMessage, content, branch)

      let { data } = await this.api.pullRequests.create({
        owner: this.info.username,
        repo: this.info.repository,
        head: branch,
        base: this.info.branch,
        title: commitMessage,
        body
      })

      return data
    } catch (err) {
      throw err
    }
  }
}

module.exports = GitHub

let gh = new GitHub({
  username: 'MunifTanjim',
  repository: 'hugotest',
  branch: 'stapsher'
})

gh
  ._getInstallationToken()
  .then(id => console.log(id))
  .catch(err => console.log(err))
