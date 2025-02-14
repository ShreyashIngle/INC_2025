import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Linkedin } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Registration successful!');
        navigate(response.data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.param] = err.msg;
        });
        setErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-[#091c2f] to-[#4A628A] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] shadow-xl overflow-hidden max-w-3xl w-full flex"
      >
        <div className="hidden md:block w-1/2 bg-[#091c2f] p-8 text-white rounded-l-[2rem]">
          <div className="h-full flex flex-col justify-center items-center text-center">
            <h2 className="text-4xl font-bold mb-6">Already signed?</h2>
            <p className="text-lg mb-12">
              Enter your personal details to use all of site features
            </p>
            <Link
              to="/login"
              className="inline-block border-2 border-white text-white px-12 py-4 rounded-xl hover:bg-[#2196F3] hover:border-[#2196F3] transition-colors text-center font-semibold"
            >
              SIGN IN
            </Link>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-4xl font-bold text-[#4A628A] mb-6">Create Account</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2196F3] text-[#4A628A] placeholder-gray-400 disabled:opacity-50 ${
                  errors.name ? 'border-2 border-red-500' : ''
                }`}
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2196F3] text-[#4A628A] placeholder-gray-400 disabled:opacity-50 ${
                  errors.email ? 'border-2 border-red-500' : ''
                }`}
                required
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2196F3] text-[#4A628A] placeholder-gray-400 disabled:opacity-50 ${
                  errors.password ? 'border-2 border-red-500' : ''
                }`}
                required
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-6 py-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2196F3] text-[#4A628A]"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A628A] text-white py-4 rounded-xl hover:bg-[#2196F3] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'SIGN UP'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;