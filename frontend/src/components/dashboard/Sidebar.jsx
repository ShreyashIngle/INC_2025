import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Calendar, Clock, FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const { language } = useLanguage();
  // const t = translations[language].nav;
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  const menuConfig = {
    farmer: [
      { icon: BookOpen, label: 'DSA Sheet', path: '/dashboard/dsa-sheet' },
      { icon: Calendar, label: 'Placement Calendar', path: '/dashboard/placement-calendar' },
      { icon: Clock, label: 'Sessions', path: '/dashboard/sessions' },
      { icon: FileText, label: 'Resume Analyzer', path: '/dashboard/resume-analyzer' }
    ],
    enterprise: [
      { icon: BookOpen, label: 'DSA Sheet', path: '/dashboard/dsa-sheet' },
      { icon: Calendar, label: 'Placement Calendar', path: '/dashboard/placement-calendar' },
      { icon: Clock, label: 'Sessions', path: '/dashboard/sessions' } 
    ]
  };

  const menuItems = menuConfig[userRole] || [];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-64 bg-gray-900 h-full fixed left-0 top-20 p-4 z-40 shadow-xl"
          >
            <div className="flex justify-end md:hidden">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-2">
              {menuItems.map((item) => {
                const isCurrentActive = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isCurrentActive
                        ? 'bg-blue-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && window.innerWidth < 768 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </>
  );
}

export default Sidebar;