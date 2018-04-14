const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const OctokitREST = require('@octokit/rest')
const config = require('../configs/server')

const { fetchInstallationId } = require('./helpers/github').app

class GitHub {
  constructor(info) {
    this.info = info || {}

    this.id = config.get('githubApp.id')
    this.privateKey = fs.readFileSync(
      path.resolve(config.get('githubApp.privateKey'))
    )

    this.api = OctokitREST({
      timeout: 5000,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'user-agent': 'extraStatic App agent'
      },
      baseUrl: 'https://api.github.com'
    })
  }

  async authAsApp() {
    try {
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

      return this.api
    } catch (err) {
      throw err
    }
  }

  async getInstallationID() {
    try {
      let id = await fetchInstallationId(this.info, this.authAsApp)

      this.installation_id = installation_id

      return id
    } catch (err) {
      throw err
    }
  }

  async getInstallationToken() {
    try {
      let installation_id = await this.getInstallationID()

      let { data } = await this.api.apps.createInstallationToken({
        installation_id
      })

      this.installation_token = data

      return data
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

      return this.api
    } catch (err) {
      throw err
    }
  }

  async readFile(path) {
    try {
      let res = await this.api.repos.getContent({
        user: this.info.username,
        repo: this.info.repository,
        ref: this.info.branch,
        path
      })

      let content = Buffer.from(res.content, 'base64').toString()

      content = JSON.parse(content)

      return content
    } catch (err) {
      throw err
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
