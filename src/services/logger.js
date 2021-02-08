// See https://thisdavej.com/using-winston-a-versatile-logging-library-for-node-js/

'use strict';
const _projectdir = require('path').resolve(__dirname, '../..');
const logDir = _projectdir + '/logs';

const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(_projectdir, 'logs', 'server_%DATE%.log');

const logger = createLogger({
  // change level if in dev environment versus production
  level: env === 'production' ? 'info' : 'debug',
  format: format.combine(
    // format.label({ label: path.basename(process.mainModule.filename) }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          info =>
            `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
/*
    new transports.File({
      filename,
      format: format.combine(
        format.printf(
          info =>
            `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
*/
    new transports.DailyRotateFile({
      name: 'file',
      datePattern: 'YYYY-MM-DD',
      filename,
      format: format.combine(
        format.printf(
          info =>
            `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
  ]
});

module.exports = logger;
