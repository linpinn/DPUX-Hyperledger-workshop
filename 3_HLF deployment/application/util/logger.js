const winston = require('winston')

require('winston-daily-rotate-file')
const {
  Logger,
  transports: { DailyRotateFile, Console }
} = winston

const logger = new Logger({
  transports: [
    new DailyRotateFile({
      level: 'debug',
      filename: './logs/log-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      handleExceptions: true,
      maxSize: '5m',
      maxFiles: '15d',
      colorize: false,
      json: true
    }),
    new Console({
      level: 'debug',
      prettyPrint: true,
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp: true
    })
  ]
})

module.exports = logger