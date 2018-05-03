require('./env')

const convict = require('convict')

const configSchema = {
  env: {
    doc: 'The application environment',
    format: ['production', 'staging', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind the application',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  cache: {
    path: {
      doc: 'Path to store Cache',
      format: String,
      default: 'cache',
      env: 'CACHE_PATH'
    }
  },
  firebase: {
    serviceAccount: {
      doc: 'Path to JSON file with Firebase service account credentials',
      format: String,
      default: null,
      env: 'FIREBASE_SERVICE_ACCOUNT'
    }
  },
  github: {
    app: {
      id: {
        doc: 'GitHub Application ID',
        format: String,
        default: null,
        env: 'GITHUB_APP_ID'
      },
      privateKey: {
        doc: 'Path to the Private Key for GitHub Application',
        format: String,
        default: null,
        env: 'GITHUB_APP_PRIVATE_KEY'
      },
      webhookSecret: {
        doc: 'Secret Token for GitHub Application Webhook',
        format: String,
        default: null,
        env: 'GITHUB_APP_WEBHOOK_SECRET'
      }
    }
  },
  gitlab: {
    bot: {
      accessToken: {
        doc: 'GitLab Bot account Access Token',
        format: String,
        default: null,
        env: 'GITLAB_BOT_ACCESS_TOKEN'
      }
    }
  },
  homeRouteRedirect: {
    doc: 'Redirect URL for home route: `/`',
    format: String,
    default: '',
    env: 'HOME_ROUTE_REDIRECT'
  },
  localtunnel: {
    subdomain: {
      doc: 'localtunnel subdomain for webhooks',
      format: String,
      default: 'stapsher',
      env: 'LOCALTUNNEL_SUBDOMAIN'
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
  rsaPrivateKey: {
    doc: 'Path to the RSA Private Key for Stapsher',
    format: String,
    default: null,
    env: 'RSA_PRIVATE_KEY'
  }
}

const config = convict(configSchema)

config.validate({ allowed: 'strict' })

module.exports = config
