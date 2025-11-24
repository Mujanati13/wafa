import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!user || !user.isAdmin) {
    // Redirect non-admin users to regular dashboard
    return <Navigate to="/dashboard/home" replace />;
  }
  
  return children;
};

export default ProtectedAdminRoute;
