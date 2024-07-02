const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log('User is authenticated');
    return next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    console.error('Authentication error: User is not authenticated');
    return res.status(401).send('You are not authenticated'); // User is not authenticated
  }
};

const roleCheck = (requiredRoles) => (req, res, next) => {
  if (req.session && req.session.userId && requiredRoles.includes(req.session.role)) {
    console.log(`Authorization success: User role is ${req.session.role}`);
    return next(); // User has the required role, proceed to the next middleware/route handler
  } else {
    console.error(`Authorization error: Access denied. Required roles: ${requiredRoles}, User role: ${req.session ? req.session.role : 'No session'}`);
    return res.status(403).send('Access denied: Insufficient permissions'); // User does not have the required role
  }
};

module.exports = {
  isAuthenticated,
  roleCheck
};