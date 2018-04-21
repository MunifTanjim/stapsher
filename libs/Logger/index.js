const config = require('../../configs/server')

const path = require('path')
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

const env = config.get('env')

const logDirectory = path.join(
  __dirname,
  '../..',
  config.get('logs.path'),
  'activities'
)

const logger = winston.createLogger()

logger.add(
  new DailyRotateFile({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    datePattern: 'YYYY-MM-DD',
    dirname: logDirectory,
    filename: `%DATE%.${config.get('env')}.log`,
    maxSize: '20m'
  })
)

if (['development', 'test'].includes(env)) {
  logger.add(
    new winston.transports.Console({
      level: 'silly',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYYMMDDHHmmss' }),
        winston.format.colorize(),
        winston.format.printf(
          info => `${info.timestamp} [${info.level}]: ${info.message}`
        )
      )
    })
  )
}

module.exports = logger
