const winston = require('winston');

// Centralized logging configuration
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.File({ filename: './logs/scrape.log', level: 'info' }),
        new winston.transports.File({ filename: './logs/errors.log', level: 'error' }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Function to log information messages
function log_info(message, context = {}) {
    logger.info(message, context);
}

// Function to log error messages
function log_error(message, error) {
    logger.error(message, { error: error.message, stack: error.stack });
}

module.exports = { log_info, log_error };