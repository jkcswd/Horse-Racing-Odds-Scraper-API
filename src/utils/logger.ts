import winston from 'winston';

const { combine, timestamp, errors } = winston.format;

// Custom format that separates log metadata from actual data
const structuredFormat = winston.format.printf(({ timestamp, level, message, service, ...data }) => {
  const logEntry = {
    timestamp,
    level,
    service,
    message,
    ...(Object.keys(data).length > 0 && { data })
  };
  return JSON.stringify(logEntry);
});

// JSON format for structured logging
const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    structuredFormat
  ),
  defaultMeta: { service: 'horse-odds-scraper' },
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        structuredFormat
      )
    })
  ]
});


export default logger;