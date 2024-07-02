const handleErrors = require('../utils/errorHandlers'); // Assuming errorHandlers.js exports a function named handleErrors
const UserModel = require('../models/userModel'); // Import the UserModel to use for database operations

exports.showRequestFundForm = (req, res) => {
    try {
        // Assuming user details are stored in session after login
        const userDetails = req.session.user;
        
        if (!userDetails) {
            console.error('User details not found in session');
            return handleErrors('User details are required but not found in session.', res);
        }

        // Render the request fund form with necessary user details
        res.render('requestFund.ejs', {
            user: userDetails
        });
    } catch (error) {
        console.error('Failed to render request fund form:', error);
        handleErrors(error, res); // Ensure consistent error handling
    }
};

// Function to fetch all users from the database
exports.fetchAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find({});
        res.json(users);
    } catch (error) {
        console.error('Failed to fetch all users:', error);
        handleErrors(error, res); // Ensure consistent error handling
    }
};