import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import Dashboard from '../pages/Dashboard';
import MapView from '../pages/dashboard/MapView';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import CropRecommendation from '../components/crop/CropRecommendation';
import Chatbot from '../pages/Chatbot';
import News from '../pages/News';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import GovernmentSchemes from '../pages/dashboard/GovernmentSchemes';
import Report from '../pages/dashboard/Report';
import WeatherForecast from '../pages/dashboard/WeatherForecast';

const ProtectedRoute = ({ children, allowedRoles = ['farmer', 'enterprise'] }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard/map" replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'services', element: <Services /> },
      { path: 'contact', element: <Contact /> },
      { 
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
        children: [
          { index: true, element: <Navigate to="map" replace /> },
          { 
            path: 'map', 
            element: <ProtectedRoute allowedRoles={['farmer', 'enterprise']}><MapView /></ProtectedRoute> 
          },
          { 
            path: 'crop-recommendation', 
            element: <ProtectedRoute allowedRoles={['farmer']}><CropRecommendation /></ProtectedRoute> 
          },
          { 
            path: 'chatbot', 
            element: <ProtectedRoute allowedRoles={['farmer']}><Chatbot /></ProtectedRoute> 
          },
          { 
            path: 'news', 
            element: <ProtectedRoute allowedRoles={['farmer']}><News /></ProtectedRoute> 
          },
          { 
            path: 'schemes', 
            element: <ProtectedRoute allowedRoles={['farmer']}><GovernmentSchemes /></ProtectedRoute> 
          },
          { 
            path: 'report', 
            element: <ProtectedRoute allowedRoles={['farmer']}><Report /></ProtectedRoute> 
          },
          { 
            path: 'weather', 
            element: <ProtectedRoute allowedRoles={['farmer','enterprise']}><WeatherForecast /></ProtectedRoute> 
          }
        ]
      },
      { 
        path: 'profile',
        element: <ProtectedRoute><Profile /></ProtectedRoute>
      },
      { 
        path: 'settings',
        element: <ProtectedRoute><Settings /></ProtectedRoute>
      },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'forgot-password', element: <ForgotPassword /> }
    ]
  }
]);