const path = require('path');

exports.showRequestFundForm = (req, res) => {
    try {
        // Assuming user details are stored in session after login
        const userDetails = req.session.user;
        
        if (!userDetails) {
            console.error('User details not found in session');
            res.status(500).send("User details are required but not found in session.");
            return;
        }

        // Render the request fund form with necessary user details
        res.render(path.join(__dirname, '..', 'views', 'requestFund.ejs'), {
            user: userDetails
        });
    } catch (error) {
        console.error('Failed to render request fund form:', error);
        res.status(500).send("An error occurred while trying to display the fund request form.");
    }
};

// Function to fetch all users
exports.fetchAllUsers = (req, res) => {
    try {
        // Fetch users logic here
        // Placeholder for actual user fetching logic
        console.log("Fetching all users"); // Log the operation
        res.send("Users fetched successfully");
    } catch (error) {
        console.error('Failed to fetch all users:', error);
        res.status(500).send("An error occurred while trying to fetch all users.");
    }
};