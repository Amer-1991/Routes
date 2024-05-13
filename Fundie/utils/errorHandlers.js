function handleErrors(error, req, res, next) {
    console.error(`An error occurred: ${error.message}`, error);
    fs.appendFileSync('app.log', `An error occurred: ${error.message}\n${error.stack}\n`);
    res.status(500).json({ error: { message: error.message || 'Unexpected error occurred' } });
}
module.exports = { handleErrors };