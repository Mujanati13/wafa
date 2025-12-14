/**
 * Authentication and Authorization Middleware
 */
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * Middleware to check if user is authenticated (supports both session and JWT)
 */
export const isAuthenticated = async (req, res, next) => {
  // First check if user is authenticated via session (Passport)
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // If not authenticated via session, check for JWT token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      console.log('Verifying JWT token for:', req.path);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.SESSION_SECRET);
      console.log('JWT decoded:', { id: decoded.id, email: decoded.email });
      const user = await User.findById(decoded.id || decoded.userId);
      if (user) {
        console.log('User found:', user.email);
        req.user = user;
        return next();
      }
      console.log('User not found for id:', decoded.id || decoded.userId);
    } catch (error) {
      console.error('JWT verification failed:', error.message);
    }
  } else {
    console.log('No Authorization header found for:', req.path);
  }
  
  return res.status(401).json({
    success: false,
    message: "Authentication required. Please login to access this resource.",
  });
};

/**
 * Middleware to check if user is an admin
 * Note: Should be used after isAuthenticated middleware
 */
export const isAdmin = (req, res, next) => {
  // Check if user exists (set by isAuthenticated or session)
  if (req.user) {
    if (req.user.isAdmin) {
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
 * Note: Should be used after isAuthenticated middleware
 */
export const isEmailVerified = (req, res, next) => {
  if (req.user) {
    if (req.user.emailVerified) {
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
 * Note: Should be used after isAuthenticated middleware
 */
export const hasActiveSubscription = (req, res, next) => {
  if (req.user) {
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
