import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Trophy,
  Award,
  Target,
  GitCommit,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';

function LeetCodeProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeetCodeProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await axios.get(
          `http://localhost:5000/api/leetcode/profile/${user.leetcodeUsername}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setProfileData(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeetCodeProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#091c2f]">
        <Sidebar />
        <div className="flex-1 ml-[250px] pt-20 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#2196F3]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#091c2f]">
        <Sidebar />
        <div className="flex-1 ml-[250px] pt-20 p-8">
          <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#091c2f]">
      <Sidebar />
      <div className="flex-1 ml-[250px] pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#05111b] rounded-2xl p-8 mb-8 shadow-lg"
          >
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profileData.username}'s LeetCode Profile
                </h1>
                <div className="flex items-center gap-4 text-gray-400">
                  <span className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#FFD700]" />
                    Rank: {profileData.ranking || 'N/A'}
                  </span>
                  <span className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#FFD700]" />
                    Contest Rating: {profileData.contest_rating || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          Stats Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {[
              {
                icon: Target,
                label: 'Problems Solved',
                value: profileData.total_problems_solved
              },
              {
                icon: GitCommit,
                label: 'Contribution Points',
                value: profileData.contribution_points
              },
              {
                icon: Clock,
                label: 'Acceptance Rate',
                value: `${profileData.acceptance_rate}%`
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#05111b] text-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <stat.icon className="w-8 h-8 text-[#2196F3]" />
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <h3 className="font-medium text-gray-400">{stat.label}</h3>
              </motion.div>
            ))}
          </div>

          {/* Recent Submissions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#05111b] rounded-2xl p-8 mb-8 shadow-lg"
          >
            <h2 className="text-xl font-bold text-white mb-6">Recent Submissions</h2>
            <div className="space-y-4">
              {profileData.recent_submissions.map((submission, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-[#091c2f] rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    {submission.status === 'Accepted' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-white">{submission.problem}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    submission.status === 'Accepted'
                      ? 'bg-green-500/20 text-green-500'
                      : 'bg-red-500/20 text-red-500'
                  }`}>
                    {submission.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#05111b] rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-xl font-bold text-white mb-6">Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileData.badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-[#091c2f] rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-[#2196F3] mb-2">
                    {badge.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default LeetCodeProfile;