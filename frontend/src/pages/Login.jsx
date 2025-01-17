import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        throw new Error('Login failed - no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-[#091c2f] to-[#4A628A] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-xl overflow-hidden max-w-4xl w-full flex"
      >
        <div className="w-full md:w-1/2 p-12">
          <h2 className="text-4xl font-bold text-[#4A628A] mb-6">Sign In</h2>
          
          <div className="flex gap-4 mb-6">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <Github className="w-6 h-6 text-[#4A628A]" />
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <Linkedin className="w-6 h-6 text-[#0A66C2]" />
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or use your email password</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2196F3] text-[#4A628A] placeholder-gray-400"
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2196F3] text-[#4A628A] placeholder-gray-400"
                required
              />
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[#4A628A] hover:text-[#2196F3]"
              >
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#4A628A] text-white py-4 rounded-xl hover:bg-[#2196F3] transition-colors font-semibold"
            >
              SIGN IN
            </button>
          </form>
        </div>

        <div className="hidden md:block w-1/2 bg-[#091c2f] p-12 text-white">
          <div className="h-full flex flex-col justify-center items-center text-center">
            <h2 className="text-4xl font-bold mb-6">Hello, Friend!</h2>
            <p className="text-lg mb-12">
              New to website? Register with your personal details
            </p>
            <Link
              to="/signup"
              className="inline-block border-2 border-white text-white px-12 py-4 rounded-xl hover:bg-[#2196F3] hover:border-[#2196F3] transition-colors text-center font-semibold"
            >
              SIGN UP
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;