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
  const logger = createLogger({
    level: level || 'info',
    format: format.json(),
    defaultMeta: { service: 'todo-service' },
    transports: [
      new transports.File({ filename: 'error.log', level: 'error' }),
      new transports.Console({
        format: format.simple(),
        level: 'info',
      }),
    ],
  });

  return logger;
}
