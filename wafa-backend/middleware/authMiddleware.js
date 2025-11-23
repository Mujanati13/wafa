/**
 * Authentication and Authorization Middleware
 */

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({
    success: false,
    message: "Authentication required. Please login to access this resource.",
  });
};

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    if (req.user && req.user.isAdmin) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  
  return res.status(401).json({
    success: false,
    message: "Authentication required. Please login to access this resource.",
  });
};

/**
 * Middleware to check if user's email is verified
 */
export const isEmailVerified = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    if (req.user && req.user.emailVerified) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: "Email verification required. Please verify your email to access this resource.",
      emailVerified: false,
    });
  }
  
  return res.status(401).json({
    success: false,
    message: "Authentication required. Please login to access this resource.",
  });
};

/**
 * Middleware to check if user has active subscription
 */
export const hasActiveSubscription = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user;
    
    // Free users can access
    if (user.plan === "Free") {
      return next();
    }
    
    // Premium users need to have valid expiry
    if (user.plan === "Premium") {
      if (!user.planExpiry || new Date(user.planExpiry) > new Date()) {
        return next();
      }
      return res.status(403).json({
        success: false,
        message: "Your premium subscription has expired. Please renew to continue.",
        subscriptionExpired: true,
      });
    }
    
    return next();
  }
  
  return res.status(401).json({
    success: false,
    message: "Authentication required. Please login to access this resource.",
  });
};

/**
 * Optional authentication - doesn't block if not authenticated
 */
export const optionalAuth = (req, res, next) => {
  // Just continue whether authenticated or not
  next();
};

export default {
  isAuthenticated,
  isAdmin,
  isEmailVerified,
  hasActiveSubscription,
  optionalAuth,
};
