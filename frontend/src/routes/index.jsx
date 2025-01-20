import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import LandingPage from '../pages/LandingPage';
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import Dashboard from '../pages/Dashboard';
import LeetCodeProfile from '../pages/LeetCodeProfile';
import DSASheet from '../pages/DSASheet';
import AdminDashboard from '../pages/AdminDashboard';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import AdminRoute from '../components/auth/AdminRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'home', element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'services', element: <Services /> },
      { path: 'contact', element: <Contact /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'dashboard/leetcode', element: <LeetCodeProfile /> },
      { path: 'dashboard/dsa', element: <DSASheet /> },
      { 
        path: 'admin/dashboard', 
        element: <AdminRoute><AdminDashboard /></AdminRoute> 
      },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'forgot-password', element: <ForgotPassword /> }
    ]
  }
]);