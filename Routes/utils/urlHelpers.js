function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (e) {
        console.error(`Invalid URL: ${string}`, { error: e.message, stack: e.stack });
        return false;
    }
}

module.exports = { isValidUrl };