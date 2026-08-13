const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required before authorization check',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden: Access restricted to roles [${allowedRoles.join(', ')}]. Your role is ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};
