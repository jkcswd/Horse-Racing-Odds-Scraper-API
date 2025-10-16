import winston from 'winston';

const { combine, timestamp, errors, json } = winston.format;

// JSON format for structured logging
const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'horse-odds-scraper' },
  transports: [
    new winston.transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        json()
      )
    })
  ]
});


export default logger;