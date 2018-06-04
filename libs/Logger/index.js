const path = require('path')
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

const config = require('../../configs/server')

const env = config.get('env')

const logDirectory = path.resolve('logs/activities')

const logger = winston.createLogger()

logger.add(
  new winston.transports.Console({
    level: ['development'].includes(env) ? 'silly' : 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYYMMDDHHmmss' }),
      winston.format.colorize(),
      winston.format.printf(
        info => `${info.timestamp} [${info.level}]: ${info.message}`
      )
    )
  })
)

logger.add(
  new DailyRotateFile({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    datePattern: 'YYYY-MM-DD',
    dirname: logDirectory,
    filename: `%DATE%.${env}.log`,
    maxSize: '20m'
  })
)

module.exports = logger
