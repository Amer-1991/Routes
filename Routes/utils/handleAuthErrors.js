const winston = require('winston');

// Configure logging
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
    defaultMeta: { service: 'user-auth-service' },
    transports: [
        new winston.transports.File({ filename: './logs/authErrors.log', level: 'error' })
    ]
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

/**
 * Handles authentication errors by logging and sending a standardized response.
 * @param {Object} res - The response object from Express.
 * @param {String} message - Error message to be displayed.
 * @param {Number} statusCode - HTTP status code for the error.
 */
function handleAuthError(res, message, statusCode) {
    logger.error('Authentication error: %s', message);
    res.status(statusCode).send({
        error: true,
        message: message
    });
}

module.exports = { handleAuthError };