const jwt = require('jsonwebtoken')
const OctokitREST = require('@octokit/rest')

const { parseFile } = require('../helpers')

const { fetchInstallationId } = require('./actions')

class GitHub {
  constructor({ info = {}, config }) {
    this.info = info
    this.config = config

    this.api = OctokitREST({
      timeout: 5000,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'user-agent': 'Stapsher agent'
      },
      baseUrl: this.config.baseUrl
    })

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
            iss: this.config.id // integration's github id
          },
          this.config.privateKey,
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

      let installationId = await this._getInstallationID()

      let { data } = await this.api.apps.createInstallationToken({
        installation_id: installationId
      })

      this.installation_token = data

      return this.installation_token
    } catch (err) {
      throw err
    }
  }

  async _authAsInstallation() {
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

  async authenticate() {
    try {
      if (this.config.type === 'app') {
        return this._authAsInstallation()
      } else if (this.config.type === 'bot') {
        return true
      }
    } catch (err) {
      throw err
    }
  }

  async readFile(path) {
    try {
      let { data } = await this.api.repos.getContent({
        owner: this.info.username,
        repo: this.info.repository,
        ref: this.info.branch,
        path
      })

      let blob = Buffer.from(data.content, 'base64').toString()

      let extension = path.split('.').pop()

      return parseFile(blob, extension)
    } catch (err) {
      throw err
    }
  }

  async writeFile(path, commitMessage, content, branch = this.info.branch) {
    try {
      let { data } = await this.api.repos.createFile({
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
