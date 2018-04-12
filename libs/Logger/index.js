const path = require('path')
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

const config = _require('configs/server')

const logDirectory = path.join(__dirname, '../..', config.get('logs.path'))

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYYMMDDHHmmss' }),
    winston.format.colorize(),
    winston.format.printf(
      info => `${info.timestamp} [${info.level}]: ${info.message}`
    )
  )
})

logger.add(new winston.transports.Console({ level: 'silly' }))

logger.add(
  new DailyRotateFile({
    datePattern: 'YYYYMMDDHH',
    dirname: logDirectory,
    filename: `%DATE%.${config.get('env')}.log`,
    format: winston.format.uncolorize(),
    maxSize: '20m'
  })
)

module.exports = logger
