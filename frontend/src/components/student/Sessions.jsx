import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Calendar, Clock, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#2196F3]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Upcoming Sessions</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <motion.div
            key={session._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#05111b] rounded-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-white mb-4">{session.title}</h3>
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

        {sessions.length === 0 && (
          <div className="col-span-full text-center text-gray-400">
            No upcoming sessions scheduled
          </div>
        )}
      </div>
    </div>
  );
}

export default Sessions;