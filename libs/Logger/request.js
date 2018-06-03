const fs = require('fs')
const path = require('path')
const morgan = require('morgan')
const rfs = require('rotating-file-stream')

const config = require('../../configs/server')

const env = config.get('env')

const requestLogger = () => {
  if (['development', 'test'].includes(env)) {
    return morgan('dev')
  } else {
    let logDirectory = path.resolve('logs/requests')

    if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory)

    let logStream = rfs(`${env}.log`, {
      interval: '1d',
      path: logDirectory,
      size: '20M',
      rotationTime: true
    })

    return morgan('common', { stream: logStream })
  }
}

module.exports = requestLogger
