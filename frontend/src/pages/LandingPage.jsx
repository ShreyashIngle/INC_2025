import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#091c2f] via-[#4A628A] to-[#2196F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-left"
          >
            <div className="inline-block bg-white/10 rounded-full px-4 py-2 mb-6">
              <span className="text-white font-medium">Your Learning Journey Starts Here</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Master Your<br />
              Tech Career<br />
              <span className="text-[#2196F3]">Step by Step</span>
            </h1>
            
            <p className="text-gray-300 text-lg mb-8 max-w-xl">
              Navigate your tech career with personalized roadmaps, AI mentoring, and comprehensive skill development. Join thousands of developers on their journey to success.
            </p>
            
            <div className="flex gap-4">
              <Link 
                to="/home"
                className="inline-flex items-center px-6 py-3 bg-[#2196F3] text-white rounded-full font-semibold hover:bg-[#1976D2] transition-colors"
              >
                Get Started
              </Link>
              
              <button className="inline-flex items-center px-6 py-3 text-white hover:bg-white/10 rounded-full font-semibold transition-colors">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1"
          >
            <img
              src="https://cdn.dribbble.com/userupload/10591531/file/original-0c14503d14c0874555dd4ee0358bb395.png?resize=1024x768"
              alt="Education Platform"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;