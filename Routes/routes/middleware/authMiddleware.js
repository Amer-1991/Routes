const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log('User is authenticated, proceeding to next middleware.');
    return next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    console.error('User is not authenticated.');
    return res.status(401).send('You are not authenticated'); // User is not authenticated
  }
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    console.log('Admin is authenticated, proceeding to next middleware.');
    return next(); // Admin is authenticated, proceed to the next middleware/route handler
  } else {
    console.error('Admin is not authenticated.');
    return res.status(403).send('Access denied'); // Admin is not authenticated
  }
};

module.exports = {
  isAuthenticated,
  isAdmin
};