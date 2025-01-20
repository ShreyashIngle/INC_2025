import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  BarChart2,
  Upload
} from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';

function AdminDashboard() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    difficulty: 'Easy',
    link: '',
    platform: '',
    articleLink: '',
    practiceLink: ''
  });
  const [bulkQuestions, setBulkQuestions] = useState('');

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
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      setLoading(false);
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

  const handleAddTopic = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/dsa/topics',
        {
          ...newTopic,
          order: topics.length + 1
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIsAddingTopic(false);
      setNewTopic({ name: '', description: '' });
      fetchTopics();
    } catch (error) {
      console.error('Failed to add topic:', error);
    }
  };

  const handleAddQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/dsa/questions',
        {
          ...newQuestion,
          topicId: selectedTopic._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIsAddingQuestion(false);
      setNewQuestion({
        title: '',
        difficulty: 'Easy',
        link: '',
        platform: '',
        articleLink: '',
        practiceLink: ''
      });
      fetchQuestions(selectedTopic._id);
    } catch (error) {
      console.error('Failed to add question:', error);
    }
  };

  const handleBulkAdd = async () => {
    try {
      const token = localStorage.getItem('token');
      const questions = bulkQuestions.split('\n').map(line => {
        const [title, articleLink, practiceLink] = line.split('\t');
        return {
          title: title.trim(),
          articleLink: articleLink?.trim() || '#',
          practiceLink: practiceLink?.trim() || '#',
          difficulty: 'Medium',
          platform: 'GeeksForGeeks'
        };
      });

      await axios.post(
        'http://localhost:5000/api/dsa/questions/bulk',
        {
          topicId: selectedTopic._id,
          questions
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setBulkQuestions('');
      fetchQuestions(selectedTopic._id);
    } catch (error) {
      console.error('Failed to add bulk questions:', error);
    }
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    fetchQuestions(topic._id);
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Topics Management */}
            <div className="bg-[#05111b] rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Topics</h2>
                <button
                  onClick={() => setIsAddingTopic(true)}
                  className="p-2 text-[#2196F3] hover:text-[#1976D2] transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>

              {isAddingTopic && (
                <div className="mb-4 p-4 bg-[#091c2f] rounded-xl">
                  <input
                    type="text"
                    placeholder="Topic Name"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                    className="w-full mb-2 px-3 py-2 bg-[#05111b] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
                  />
                  <textarea
                    placeholder="Description"
                    value={newTopic.description}
                    onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                    className="w-full mb-2 px-3 py-2 bg-[#05111b] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsAddingTopic(false)}
                      className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddTopic}
                      className="px-3 py-1 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

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

            {/* Questions Management */}
            <div className="md:col-span-3">
              {selectedTopic ? (
                <div className="bg-[#05111b] rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                      {selectedTopic.name} Questions
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsAddingQuestion(true)}
                        className="p-2 text-[#2196F3] hover:text-[#1976D2] transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                      <button
                        onClick={() => document.getElementById('bulkUpload').click()}
                        className="p-2 text-[#2196F3] hover:text-[#1976D2] transition-colors"
                      >
                        <Upload size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Bulk Upload */}
                  <input
                    id="bulkUpload"
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setBulkQuestions(event.target.result);
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />

                  {bulkQuestions && (
                    <div className="mb-4 p-4 bg-[#091c2f] rounded-xl">
                      <textarea
                        value={bulkQuestions}
                        onChange={(e) => setBulkQuestions(e.target.value)}
                        className="w-full mb-2 px-3 py-2 bg-[#05111b] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3] h-40"
                        placeholder="Paste questions in format: Title\tArticle Link\tPractice Link"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setBulkQuestions('')}
                          className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleBulkAdd}
                          className="px-3 py-1 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] transition-colors"
                        >
                          Add All
                        </button>
                      </div>
                    </div>
                  )}

                  {isAddingQuestion && (
                    <div className="mb-4 p-4 bg-[#091c2f] rounded-xl">
                      <input
                        type="text"
                        placeholder="Question Title"
                        value={newQuestion.title}
                        onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                        className="w-full mb-2 px-3 py-2 bg-[#05111b] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
                      />
                      <select
                        value={newQuestion.difficulty}
                        onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                        className="w-full mb-2 px-3 py-2 bg-[#05111b] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Article Link"
                        value={newQuestion.articleLink}
                        onChange={(e) => setNewQuestion({ ...newQuestion, articleLink: e.target.value })}
                        className="w-full mb-2 px-3 py-2 bg-[#05111b] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
                      />
                      <input
                        type="text"
                        placeholder="Practice Link"
                        value={newQuestion.practiceLink}
                        onChange={(e) => setNewQuestion({ ...newQuestion, practiceLink: e.target.value })}
                        className="w-full mb-2 px-3 py-2 bg-[#05111b] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
                      />
                      <input
                        type="text"
                        placeholder="Platform (e.g., LeetCode, GeeksForGeeks)"
                        value={newQuestion.platform}
                        onChange={(e) => setNewQuestion({ ...newQuestion, platform: e.target.value })}
                        className="w-full mb-2 px-3 py-2 bg-[#05111b] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsAddingQuestion(false)}
                          className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddQuestion}
                          className="px-3 py-1 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div
                        key={question._id}
                        className="bg-[#091c2f] rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-medium">
                              {question.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                              <span className={`text-sm ${
                                question.difficulty === 'Easy'
                                  ? 'text-green-500'
                                  : question.difficulty === 'Medium'
                                  ? 'text-yellow-500'
                                  : 'text-red-500'
                              }`}>
                                {question.difficulty}
                              </span>
                              <a
                                href={question.articleLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#2196F3] hover:text-[#1976D2]"
                              >
                                Article
                              </a>
                              <a
                                href={question.practiceLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#2196F3] hover:text-[#1976D2]"
                              >
                                Practice
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-white transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#05111b] rounded-xl p-6 shadow-lg flex items-center justify-center h-full">
                  <p className="text-gray-400">Select a topic to manage questions</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;