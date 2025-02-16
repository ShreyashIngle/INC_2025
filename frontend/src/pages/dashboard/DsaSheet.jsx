import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function DsaSheet() {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    link: '',
    platform: '',
    difficulty: 'Easy'
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/dsa/topics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTopics(response.data);
    } catch (error) {
      toast.error('Failed to fetch topics');
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/dsa/topics',
        newTopic,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTopics([...topics, response.data]);
      setNewTopic({ name: '', description: '' });
      toast.success('Topic created successfully');
    } catch (error) {
      toast.error('Failed to create topic');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/dsa/topics/${selectedTopic._id}/questions`,
        newQuestion,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTopics(topics.map(topic => 
        topic._id === selectedTopic._id ? response.data : topic
      ));
      
      setNewQuestion({
        title: '',
        link: '',
        platform: '',
        difficulty: 'Easy'
      });
      
      toast.success('Question added successfully');
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const handleDeleteQuestion = async (topicId, questionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `http://localhost:5000/api/dsa/topics/${topicId}/questions/${questionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTopics(topics.map(topic => 
        topic._id === topicId ? response.data : topic
      ));
      
      toast.success('Question deleted successfully');
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/dsa/topics/${topicId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTopics(topics.filter(topic => topic._id !== topicId));
      setSelectedTopic(null);
      toast.success('Topic deleted successfully');
    } catch (error) {
      toast.error('Failed to delete topic');
    }
  };

  return (
    <div className="p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        DSA Sheet
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Topics List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Topic</h2>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <input
                type="text"
                value={newTopic.name}
                onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                placeholder="Topic Name"
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <textarea
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                placeholder="Topic Description"
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
              />
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Topic
              </button>
            </form>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Topics</h2>
            <div className="space-y-2">
              {topics.map(topic => (
                <div
                  key={topic._id}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedTopic?._id === topic._id
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{topic.name}</h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTopic(topic._id);
                      }}
                      className="p-1 hover:bg-red-500 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{topic.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="lg:col-span-2">
          {selectedTopic ? (
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-6">{selectedTopic.name}</h2>
              
              {/* Add Question Form */}
              <form onSubmit={handleAddQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <input
                  type="text"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  placeholder="Question Title"
                  className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <input
                  type="url"
                  value={newQuestion.link}
                  onChange={(e) => setNewQuestion({ ...newQuestion, link: e.target.value })}
                  placeholder="Question Link"
                  className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <input
                  type="text"
                  value={newQuestion.platform}
                  onChange={(e) => setNewQuestion({ ...newQuestion, platform: e.target.value })}
                  placeholder="Platform (e.g., LeetCode, CodeForces)"
                  className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <select
                  value={newQuestion.difficulty}
                  onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                  className="px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <button
                  type="submit"
                  className="md:col-span-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Question
                </button>
              </form>

              {/* Questions List */}
              <div className="space-y-4">
                {selectedTopic.questions.map(question => (
                  <div
                    key={question._id}
                    className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-medium">{question.title}</h3>
                      <p className="text-sm text-gray-300">Platform: {question.platform}</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                          question.difficulty === 'Easy'
                            ? 'bg-green-500/20 text-green-500'
                            : question.difficulty === 'Medium'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {question.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={question.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => handleDeleteQuestion(selectedTopic._id, question._id)}
                        className="p-2 hover:bg-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <h2 className="text-xl text-gray-400">Select a topic to view and manage questions</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DsaSheet;