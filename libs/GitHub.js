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

    this.authenticateAsApp()
  }

  authenticateAsApp() {
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
  }

  async getInstallationID() {
    try {
      let id = await fetchInstallationId(this.info, this.api)

      return Promise.resolve(id)
    } catch (err) {
      console.error(err)
    }
  }

  async getInstallationToken() {
    try {
      let installation_id = await this.getInstallationID()

      this.installation_id = installation_id

      let { data } = await this.api.apps.createInstallationToken({
        installation_id
      })

      return Promise.resolve(data)
    } catch (err) {
      console.error(err)
    }
  }

  async authenticateAsInstallation() {
    try {
      let { token } = await this.getInstallationToken()
    } catch (err) {
      console.error(err)
    }
  }

  async getInstallations() {
    try {
      let response = await this.api.apps.getInstallations()
      return response.data
    } catch (err) {
      console.error(err)
    }
  }
}

// LET GITHUBAPP LIVE LONG AND LET INSTALLATIONS DIE

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
