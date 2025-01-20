import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Book,
  Star,
  CheckCircle,
  PlusCircle,
  Edit3,
  BarChart2
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';

function DSASheet() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    fetchTopics();
    fetchProgress();
  }, []);

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/dsa/topics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopics(response.data);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const fetchQuestions = async (topicId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/dsa/topics/${topicId}/questions`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/dsa/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(response.data);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    fetchQuestions(topic._id);
  };

  const handleToggleStar = async (questionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/dsa/questions/${questionId}/star`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchQuestions(selectedTopic._id);
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleMarkSolved = async (questionId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/dsa/questions/${questionId}/solve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchQuestions(selectedTopic._id);
      fetchProgress();
    } catch (error) {
      console.error('Failed to mark as solved:', error);
    }
  };

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

  return (
    <div className="flex min-h-screen bg-[#091c2f]">
      <Sidebar />
      <div className="flex-1 ml-[250px] pt-20 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {progress.map((item) => (
              <motion.div
                key={item.topic}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#05111b] rounded-xl p-6 shadow-lg"
              >
                <h3 className="text-white font-semibold mb-2">{item.topic}</h3>
                <div className="flex items-center justify-between text-gray-400">
                  <span>{item.solved} / {item.total} solved</span>
                  <span>{Math.round(item.percentage)}%</span>
                </div>
                <div className="mt-2 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#2196F3] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Topics List */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-[#05111b] rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-6">Topics</h2>
              <div className="space-y-2">
                {topics.map((topic) => (
                  <button
                    key={topic._id}
                    onClick={() => handleTopicSelect(topic)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedTopic?._id === topic._id
                        ? 'bg-[#2196F3] text-white'
                        : 'text-gray-400 hover:bg-[#2196F3]/10 hover:text-white'
                    }`}
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            <div className="md:col-span-3">
              {selectedTopic ? (
                <div className="bg-[#05111b] rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-white mb-6">
                    {selectedTopic.name} Questions
                  </h2>
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div
                        key={question._id}
                        className="bg-[#091c2f] rounded-xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <h3 className="text-white font-medium">
                            {question.title}
                          </h3>
                          <span className={`text-sm ${
                            question.difficulty === 'Easy'
                              ? 'text-green-500'
                              : question.difficulty === 'Medium'
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          }`}>
                            {question.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleToggleStar(question._id)}
                            className={`p-2 rounded-lg transition-colors ${
                              question.starredBy?.includes(localStorage.getItem('userId'))
                                ? 'text-yellow-500'
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                          >
                            <Star size={20} />
                          </button>
                          <button
                            onClick={() => handleMarkSolved(question._id)}
                            className={`p-2 rounded-lg transition-colors ${
                              question.solvedBy?.some(
                                solve => solve.userId === localStorage.getItem('userId')
                              )
                                ? 'text-green-500'
                                : 'text-gray-400 hover:text-green-500'
                            }`}
                          >
                            <CheckCircle size={20} />
                          </button>
                          <a
                            href={question.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#2196F3] hover:text-[#1976D2] transition-colors"
                          >
                            Solve
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#05111b] rounded-xl p-6 shadow-lg flex items-center justify-center h-full">
                  <p className="text-gray-400">Select a topic to view questions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DSASheet;