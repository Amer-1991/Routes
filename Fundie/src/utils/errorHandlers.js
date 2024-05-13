// Error handling utility functions

const fs = require('fs');

/**
 * Handles errors by logging them to the console and a file.
 * @param {Error} error - The error object to handle.
 * @param {string} type - The type of the error for categorization.
 */
function handleErrors(error, type = 'general') {
    const errorType = type.toUpperCase();
    console.error(`Error Type: ${errorType} - Message:`, error.message);
    fs.appendFileSync('app.log', `${new Date().toISOString()} - Error Type: ${errorType} - ${error.stack}\n`);

    // Log the full error stack to the console for debugging
    console.error(error.stack);
}

module.exports = {
    handleErrors
};