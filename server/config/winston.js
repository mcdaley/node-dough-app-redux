//-----------------------------------------------------------------------------
// server/config/winston.js
//-----------------------------------------------------------------------------
const appRoot     = require('app-root-path') 
const winston     = require('winston')
const { 
  combine, 
  timestamp, 
  label, 
  printf 
}                 = require('winston').format

const doughAppFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${level}] [${label}]: ${message}`;
});

// Configure loggin options
var options = {
  file: {
    level:            'debug',
    filename:         `${appRoot}/logs/${process.env.LOG_FILE}.log`,
    handleExceptions: true,
    json:             true,
    maxsize:          5242880, // 5MB
    maxFiles:         5,
    colorize:         false,
    format:           combine(
      label({ label: 'dough' }),
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.splat(),
      winston.format.json(),
      doughAppFormat,
    ),
  },
  console: {
    level:            'debug',
    handleExceptions: true,
    json:             false,
    colorize:         true,
    format:           combine(
      label({ label: 'dough' }),
      timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.colorize(),
      winston.format.splat(),
      winston.format.json(),
      doughAppFormat,
    )
  },
}

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    //* new winston.transports.Console(options.console)
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// If in development mode then add the console output.
if (process.env.NODE_ENV === 'development') {
  logger.add(new winston.transports.Console(options.console))
}

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

// Export the logger
module.exports = logger
