import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogIn, Leaf, MessageSquare, Newspaper } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../utils/translations';
import ProfileIcon from './ProfileIcon';
import logo from "../../images/logo.png";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language].nav;
  const token = localStorage.getItem('token');

  const navItems = [
    { label: t.home, path: '/' },
    { label: t.about, path: '/about' },
    { label: t.services, path: '/services' },
    { label: t.contact, path: '/contact' },
    { label: t.dashboard, path: '/dashboard' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex-shrink-0">
            <img className="h-12 w-auto" src={logo} alt="Logo" />
          </Link>
          
          <div className="hidden md:flex md:items-center">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <motion.div key={item.label} whileHover={{ scale: 1.05 }}>
                  <Link
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover-effect
                      ${isActive(item.path) ? 'text-brand-green' : 'text-gray-300 hover:text-white'}`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="ml-8">
              {token ? (
                <ProfileIcon />
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-green text-black font-medium hover:bg-opacity-90 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  {t.login}
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white hover-effect"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-black/95 backdrop-blur-md"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium hover-effect
                  ${isActive(item.path) ? 'text-brand-green' : 'text-gray-300 hover:text-white'}`}
              >
                {item.label}
              </Link>
            ))}
            {token ? (
              <div className="px-3 py-2">
                <ProfileIcon />
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover-effect"
              >
                {t.login}
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

export default Navbar;