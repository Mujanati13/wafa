import { Navigate, useLocation } from 'react-router-dom';

// Define which permissions are required for each route
const ROUTE_PERMISSIONS = {
  '/admin/analytics': 'analytics',
  '/admin/subscription': 'payments',
  '/admin/paypal-settings': 'payments',
};

// Routes that require super_admin role (not just permissions)
const SUPER_ADMIN_ONLY_ROUTES = [
  '/admin/analytics',
  '/admin/subscription',
  '/admin/paypal-settings',
];

const ProtectedAdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();

  if (!user || !user.isAdmin) {
    // Redirect non-admin users to regular dashboard
    return <Navigate to="/dashboard/home" replace />;
  }

  // Check if user is super_admin (has access to everything)
  const isSuperAdmin = user.adminRole === 'super_admin';

  // If not super_admin, check route-specific permissions
  if (!isSuperAdmin) {
    const currentPath = location.pathname;

    // Check if this is a super_admin only route
    if (SUPER_ADMIN_ONLY_ROUTES.includes(currentPath)) {
      // Redirect editors to admin home or show access denied
      return <Navigate to="/admin/leaderboard" replace />;
    }

    // Check if route requires specific permission
    const requiredPermission = ROUTE_PERMISSIONS[currentPath];
    if (requiredPermission && !user.permissions?.includes(requiredPermission)) {
      return <Navigate to="/admin/leaderboard" replace />;
    }
  }

  return children;
};

export default ProtectedAdminRoute;
