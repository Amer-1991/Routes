function initializeUserSession(req, user) {
    try {
        req.session.userId = user._id.toString(); // Store user ID in session
        req.session.role = user.role; // Store user role in session
        console.log(`Session initialized for user: ${user.username}`);
    } catch (error) {
        console.error('Error during session initialization:', error.message, error.stack);
    }
}

module.exports = {
    initializeUserSession
};