import { createLogger, transports, format, Logger } from 'winston';

export enum LogLevel {
  error = 'error',
  warn = 'warn',
  info = 'info',
  http = 'http',
  verbose = 'verbose',
  debug = 'debug',
  silly = 'silly',
}

export function createNodeLogger(level: LogLevel): Logger {
  const myFormat = format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  });
  const logger = createLogger({
    level: level || 'info',
    format: format.combine(format.timestamp(), myFormat),
    defaultMeta: { service: 'todo-service' },
    transports: [
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.Console({
        format: format.combine(format.timestamp(), myFormat),
        level: 'info',
      }),
    ],
  });

  return logger;
}
