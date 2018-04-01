const config = require('./server')

const stapsherApp = {
  name: 'stapsher',
  script: 'index.js',
  kill_timeout: config.get('stapsher.killTimeout'),
  env: {
    NODE_ENV: 'development'
  },
  env_production: {
    NODE_ENV: 'production'
  },
  env_staging: {
    NODE_ENV: 'staging'
  }
}

if (config.get('stapsher.cluster.enable')) {
  stapsherApp.exec_mode = 'cluster'
  stapsherApp.instances = config.get('stapsher.cluster.instances')
}

const pm2Config = {
  apps: [stapsherApp]
}

module.exports = pm2Config
