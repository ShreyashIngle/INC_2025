import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  LogOut,
  BookOpen,
  Shield
} from 'lucide-react';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const menuItems = [
    { icon: Home, label: 'Overview', path: '/dashboard' },
    { icon: Code2, label: 'LeetCode Profile', path: '/dashboard/leetcode' },
    { icon: BookOpen, label: 'DSA Sheet', path: '/dashboard/dsa' },
    { icon: MessageSquare, label: 'Chatbot', path: '/dashboard/chatbot' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ...(user?.role === 'admin' ? [
      { icon: Shield, label: 'Admin', path: '/admin/dashboard' }
    ] : [])
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.div
      initial={{ width: 250 }}
      animate={{ width: isCollapsed ? 80 : 250 }}
      className={`h-screen bg-[#091c2f] fixed left-0 top-0 z-40 transition-all duration-300 pt-20`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-[-12px] top-24 bg-[#2196F3] text-white p-2 rounded-full"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className="flex flex-col h-full">
        <div className="flex-1 py-8 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-4 p-3 rounded-lg mb-2 transition-all duration-300
                ${isActive(item.path)
                  ? 'bg-[#2196F3] text-white'
                  : 'text-gray-400 hover:bg-[#2196F3]/10 hover:text-white'}`}
            >
              <item.icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="flex items-center gap-4 p-3 rounded-lg w-full text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default Sidebar;