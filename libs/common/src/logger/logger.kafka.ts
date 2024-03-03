import { logLevel } from 'kafkajs';
import { transports, createLogger } from 'winston';
//  import 'dotenv/config';
import { config } from 'dotenv';
config({ path: './' });

const toWinstonLogLevel = (level: logLevel) => {
  switch (level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
      return 'error';
    case logLevel.WARN:
      return 'warn';
    case logLevel.INFO:
      return 'info';
    case logLevel.DEBUG:
      return 'debug';
  }
};

export const WinstonLogCreator = (
  logLevel: logLevel,
  path: string = './apps/live-feed',
) => {
  const devLogger = new transports.Console();

  const prodLogger = new transports.File({
    filename: 'app.log',
    dirname: `${path}/${process.env.LOG_DIR}`,
    maxsize: Number(process.env.LOG_MAXSIZE),
    maxFiles: Number(process.env.LOG_MAXFILES),
  });

  const logger = createLogger({
    level: toWinstonLogLevel(logLevel),
    transports: [
      process.env.NODE_ENV !== 'production' ? devLogger : prodLogger,
    ],
  });

  return ({ namespace, level, label, log }) => {
    const { message, ...extra } = log;
    // console.log(extra);
    logger.log({
      level: toWinstonLogLevel(level),
      message,
      namespace,
      ...extra,
    });
  };
};
