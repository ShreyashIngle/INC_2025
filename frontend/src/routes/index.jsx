import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import LandingPage from '../pages/LandingPage';
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Contact from '../pages/Contact';
import Dashboard from '../pages/Dashboard';
import DSASheet from '../pages/DSASheet';
import AdminDashboard from '../pages/AdminDashboard';
import SessionManager from '../components/admin/SessionManager';
import MarqueeManager from '../components/admin/MarqueeManager';
import PlacementCalendar from '../components/admin/PlacementCalendar';
import Sessions from '../components/student/Sessions';
import PlacementCalendarView from '../components/student/PlacementCalendarView';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import ProtectedRoute from '../components/auth/ProtectedRoute';

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
      { 
        path: 'dashboard', 
        element: <ProtectedRoute allowedRoles={['student']}><Dashboard /></ProtectedRoute> 
      },
      { 
        path: 'dashboard/dsa', 
        element: <ProtectedRoute><DSASheet /></ProtectedRoute> 
      },
      { 
        path: 'dashboard/sessions', 
        element: <ProtectedRoute><Sessions /></ProtectedRoute> 
      },
      { 
        path: 'dashboard/placement-calendar', 
        element: <ProtectedRoute><PlacementCalendarView /></ProtectedRoute> 
      },
      { 
        path: 'admin/dashboard', 
        element: <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute> 
      },
      {
        path: 'admin/sessions',
        element: <ProtectedRoute allowedRoles={['admin']}><SessionManager /></ProtectedRoute>
      },
      {
        path: 'admin/marquee',
        element: <ProtectedRoute allowedRoles={['admin']}><MarqueeManager /></ProtectedRoute>
      },
      {
        path: 'admin/placement-calendar',
        element: <ProtectedRoute allowedRoles={['admin']}><PlacementCalendar /></ProtectedRoute>
      },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'forgot-password', element: <ForgotPassword /> }
    ]
  }
]);