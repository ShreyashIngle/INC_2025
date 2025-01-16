import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from "../../images/logo.jpg";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const navItems = [
    { label: 'Home', path: '/home' },
    { label: 'Dashboard', path: '/dashboard' },
    token 
      ? { label: 'Logout', path: '#', onClick: () => {
          localStorage.removeItem('token');
          navigate('/login');
        }}
      : { label: 'Login', path: '/login', icon: LogIn }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${location.pathname === '/' ? 'bg-transparent' : ' bg-[#091c2f]/80 backdrop-blur-md shadow-lg'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0">
            <img
              className="h-12 w-auto"
              src={logo}
              alt="Logo"
            />
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={item.onClick}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover-effect flex items-center gap-2
                      ${isActive(item.path) 
                        ? 'text-[#2196F3]' 
                        : 'text-[#4A628A] hover:text-[#2196F3]'}`}
                  >
                    {item.icon && <item.icon size={18} />}
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#4A628A] hover:text-[#2196F3] hover-effect"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white shadow-lg"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick?.();
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium hover-effect flex items-center gap-2
                  ${isActive(item.path)
                    ? 'text-[#2196F3]'
                    : 'text-[#4A628A] hover:text-[#2196F3]'}`}
              >
                {item.icon && <item.icon size={18} />}
                {item.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

export default Navbar;