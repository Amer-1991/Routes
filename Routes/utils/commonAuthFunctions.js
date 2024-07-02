const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function verifyUserCredentials(username, password) {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return null;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch ? user : null;
    } catch (error) {
        console.error('Error verifying user credentials:', error.message, error.stack);
        throw new Error('Error processing login');
    }
}

module.exports = {
    verifyUserCredentials
};