import { Navigate, useLocation } from 'react-router-dom';

// Define which permissions are required for each route
const ROUTE_PERMISSIONS = {
  // Analytics - requires analytics permission
  '/admin/analytics': 'analytics',
  
  // Users management - requires users permission
  '/admin/users': 'users',
  '/admin/sub-admins': 'users',
  
  // Content management - requires content permission
  '/admin/semesters': 'content',
  '/admin/module': 'content',
  '/admin/categoriesOfModules': 'content',
  '/admin/createCategoriesForCourses': 'content',
  '/admin/examParYears': 'content',
  '/admin/examCourses': 'content',
  '/admin/qcmBanque': 'content',
  '/admin/addQuestions': 'content',
  '/admin/resumes': 'content',
  '/admin/importExamParYears': 'content',
  '/admin/importExamParCourse': 'content',
  '/admin/importQCMBanque': 'content',
  '/admin/importResumes': 'content',
  '/admin/importExplications': 'content',
  '/admin/generateExplanationsAI': 'content',
  '/admin/importImages': 'content',
  
  // Reports - requires reports permission
  '/admin/explications': 'reports',
  '/admin/report-questions': 'reports',
  
  // Payments - requires payments permission
  '/admin/subscription': 'payments',
  '/admin/demandes-de-paiements': 'payments',
  '/admin/paypal-settings': 'payments',
  
  // Notifications - requires notifications permission
  '/admin/notifications': 'notifications',
  
  // Settings - requires settings permission
  '/admin/landing-settings': 'settings',
  '/admin/privacy-policy': 'settings',
  '/admin/contact-messages': 'settings',
  
  // Leaderboard - accessible to all admins (no specific permission)
  // '/admin/leaderboard': null,
};

// Routes that require super_admin role only (no one else can access)
const SUPER_ADMIN_ONLY_ROUTES = [
  '/admin/sub-admins', // Only super_admin can manage other admins
];

// Routes that all admins can access regardless of permissions
const PUBLIC_ADMIN_ROUTES = [
  '/admin/leaderboard',
  '/admin/profile',
  '/admin/settings',
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
  const userPermissions = user.permissions || [];

  // If super_admin, allow access to everything
  if (isSuperAdmin) {
    return children;
  }

  const currentPath = location.pathname;

  // Check if this is a super_admin only route
  if (SUPER_ADMIN_ONLY_ROUTES.includes(currentPath)) {
    // Redirect non-super-admins to leaderboard
    return <Navigate to="/admin/leaderboard" replace />;
  }

  // Check if this is a public admin route (accessible to all admins)
  if (PUBLIC_ADMIN_ROUTES.includes(currentPath)) {
    return children;
  }

  // Check if route requires specific permission
  const requiredPermission = ROUTE_PERMISSIONS[currentPath];
  
  if (requiredPermission && !userPermissions.includes(requiredPermission)) {
    // User doesn't have required permission, redirect to leaderboard
    return <Navigate to="/admin/leaderboard" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
