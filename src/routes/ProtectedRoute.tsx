import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, UserType } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedTypes?: UserType[];
}

const ProtectedRoute = ({ allowedTypes }: ProtectedRouteProps) => {
  const { isAuthenticated, getUserType } = useAuth();
  const location = useLocation();
  
  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Se houver tipos permitidos definidos, verificar se o usuário tem permissão
  if (allowedTypes && allowedTypes.length > 0) {
    const userType = getUserType();
    if (!userType || !allowedTypes.includes(userType)) {
      // Redirecionar para a página apropriada baseada no tipo de usuário
      if (userType === UserType.CONSUMIDOR) {
        return <Navigate to="/products" replace />;
      } else if (userType === UserType.FORNECEDOR) {
        return <Navigate to="/list" replace />;
      }
      
      // Fallback se algo der errado
      //return <Navigate to="/" replace />;
    }
  }
  
  // Se estiver autenticado e tiver permissão, renderizar as rotas filhas
  return <Outlet />;
};

export default ProtectedRoute;