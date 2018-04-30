require('./env')

const convict = require('convict')

const configSchema = {
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind the application.',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  rsaPrivateKey: {
    doc: 'Path to RSA Private Key.',
    format: String,
    default: 'secrets/stapsher.private-key.pem',
    env: 'RSA_PRIVATE_KEY'
  },
  firebase: {
    serviceAccount: {
      doc: 'Path to JSON file with Firebase service account credentials',
      format: String,
      default: null,
      env: 'FIREBASE_SERVICE_ACCOUNT'
    }
  },
  githubApp: {
    id: {
      doc: 'The ID of the GitHub Application.',
      format: String,
      default: null,
      env: 'GITHUB_APP_ID'
    },
    clientId: {
      doc:
        'The client ID to the GitHub Application used for GitHub authentication.',
      format: String,
      default: null,
      env: 'GITHUB_APP_CLIENT_ID'
    },
    clientSecret: {
      doc:
        'The client secret to the GitHub Application used for GitHub authentication.',
      format: String,
      default: '',
      env: 'GITHUB_APP_CLIENT_SECRET'
    },
    privateKey: {
      doc: 'Path to the private key for GitHub App',
      format: String,
      default: 'secrets/stapsher.private-key.pem',
      env: 'GITHUB_APP_PRIVATE_KEY'
    },
    webhookSecret: {
      doc: 'Webhook secret token for GitHub App',
      format: String,
      default: null,
      env: 'GITHUB_APP_WEBHOOK_SECRET'
    }
  },
  localtunnel: {
    subdomain: {
      doc: 'localtunnel subdomain for webhooks',
      format: String,
      default: 'stapsher',
      env: 'LOCALTUNNEL_SUBDOMAIN'
    }
  },
  cache: {
    path: {
      doc: 'Cache path',
      format: String,
      default: 'cache',
      env: 'CACHE_PATH'
    }
  },
  logs: {
    path: {
      doc: 'Directory for server logs',
      format: String,
      default: 'logs',
      env: 'LOGS_PATH'
    }
  },
  gitlab: {
    accessToken: {
      doc: 'Access Token for GitLab bot account',
      format: String,
      default: null,
      env: 'GITLAB_BOT_ACCESS_TOKEN'
    }
  }
}

const config = convict(configSchema)

config.validate({ allowed: 'strict' })

module.exports = config
