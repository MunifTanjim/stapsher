const fs = require('fs')
const path = require('path')
const morgan = require('morgan')

const config = _require('configs/server')

const logger = _require('libs/Logger')

const requestLogger = () => {
  let env = config.get('env')

  if (env === 'development') {
    return morgan('dev', {
      stream: { write: msg => logger.info(msg.trim()) }
    })
  } else if (env === 'production' || env === 'staging') {
    let logDirectory = path.join(__dirname, '../..', config.get('logs.path'))

    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

    let apiLogStream = rfs(`api.${env}.log`, {
      interval: '1d',
      path: logDirectory
    })

    return morgan('common', { stream: apiLogStream })
  }
}

module.exports = requestLogger
