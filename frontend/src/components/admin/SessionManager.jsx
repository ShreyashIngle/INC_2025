import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Plus, X, Calendar, Clock, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

function SessionManager() {
  const [sessions, setSessions] = useState([]);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    meetLink: '',
    dateTime: ''
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(response.data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to fetch sessions');
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/sessions',
        newSession,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIsAddingSession(false);
      setNewSession({
        title: '',
        description: '',
        meetLink: '',
        dateTime: ''
      });
      fetchSessions();
      toast.success('Session created successfully');
    } catch (error) {
      console.error('Failed to create session:', error);
      toast.error('Failed to create session');
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSessions();
      toast.success('Session deleted successfully');
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast.error('Failed to delete session');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Sessions</h2>
        <button
          onClick={() => {
            console.log('Add Session button clicked');
            setIsAddingSession(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] transition-colors"
        >
          <Plus size={20} />
          Add Session
        </button>
      </div>

      {isAddingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#05111b] rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add New Session</h3>
              <button
                onClick={() => setIsAddingSession(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Session Title"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#091c2f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
                  required
                />
              </div>

              <div>
                <textarea
                  placeholder="Description"
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#091c2f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3] h-32 resize-none"
                  required
                />
              </div>

              <div>
                <input
                  type="url"
                  placeholder="Meet Link"
                  value={newSession.meetLink}
                  onChange={(e) => setNewSession({ ...newSession, meetLink: e.target.value })}
                  className="w-full px-4 py-2 bg-[#091c2f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
                  required
                />
              </div>

              <div>
                <input
                  type="datetime-local"
                  value={newSession.dateTime}
                  onChange={(e) => setNewSession({ ...newSession, dateTime: e.target.value })}
                  className="w-full px-4 py-2 bg-[#091c2f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3]"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddingSession(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] transition-colors"
                >
                  Create Session
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <motion.div
            key={session._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#05111b] rounded-xl p-6 shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{session.title}</h3>
              <button
                onClick={() => handleDeleteSession(session._id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-400 mb-4">{session.description}</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar size={16} />
                <span>{new Date(session.dateTime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={16} />
                <span>{new Date(session.dateTime).toLocaleTimeString()}</span>
              </div>
              <a
                href={session.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#2196F3] hover:text-[#1976D2] transition-colors"
              >
                <LinkIcon size={16} />
                Join Meeting
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default SessionManager;