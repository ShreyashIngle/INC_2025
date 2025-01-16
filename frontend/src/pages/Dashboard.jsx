import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Activity,
  Award,
  BookOpen,
  Code,
  Trophy,
  Target,
  Calendar,
  TrendingUp
} from 'lucide-react';

function Dashboard() {
  const [leetcodeData, setLeetcodeData] = useState({
    profile: null,
    solved: null,
    submissions: null,
    contests: null,
    badges: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeetCodeData = async () => {
      try {
        const token = localStorage.getItem('token');
        const username = 'YOUR_USERNAME'; // Get this from user context/state

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [profile, solved, submissions, contests, badges] = await Promise.all([
          axios.get(`/api/leetcode/profile/${username}`, { headers }),
          axios.get(`/api/leetcode/solved/${username}`, { headers }),
          axios.get(`/api/leetcode/submissions/${username}`, { headers }),
          axios.get(`/api/leetcode/contests/${username}`, { headers }),
          axios.get(`/api/leetcode/badges/${username}`, { headers })
        ]);

        setLeetcodeData({
          profile: profile.data,
          solved: solved.data,
          submissions: submissions.data,
          contests: contests.data,
          badges: badges.data
        });
      } catch (error) {
        console.error('Failed to fetch LeetCode data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeetCodeData();
  }, []);

  const stats = [
    {
      icon: Code,
      label: 'Problems Solved',
      value: leetcodeData.solved?.totalSolved || 0
    },
    {
      icon: Activity,
      label: 'Submissions',
      value: leetcodeData.submissions?.totalSubmissions || 0
    },
    {
      icon: Trophy,
      label: 'Contest Rating',
      value: leetcodeData.profile?.contestRating || 0
    },
    {
      icon: Award,
      label: 'Badges Earned',
      value: leetcodeData.badges?.totalBadges || 0
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#2196F3]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-[#DFF2EB] via-[#B9E5E8] to-[#7AB2D3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-[#2196F3]" />
                <span className="text-3xl font-bold text-[#4A628A]">{stat.value}</span>
              </div>
              <h3 className="text-[#4A628A] font-medium">{stat.label}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Submissions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-[#4A628A] mb-4 flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-[#2196F3]" />
              Recent Submissions
            </h2>
            <div className="space-y-4">
              {leetcodeData.submissions?.submissions?.slice(0, 5).map((submission, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <span className="text-[#4A628A] font-medium">{submission.title}</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    submission.statusDisplay === 'Accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {submission.statusDisplay}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contest History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-[#4A628A] mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-[#2196F3]" />
              Contest Performance
            </h2>
            <div className="space-y-4">
              {leetcodeData.contests?.contestHistory?.slice(0, 5).map((contest, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <span className="text-[#4A628A] font-medium">{contest.contestName}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-[#4A628A]">Rank: {contest.ranking}</span>
                    <span className="text-[#2196F3]">Rating: {contest.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;