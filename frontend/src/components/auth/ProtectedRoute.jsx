import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles = ['student', 'admin'] }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;