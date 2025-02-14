import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Plus, X, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

function MarqueeManager() {
  const [marquees, setMarquees] = useState([]);
  const [isAddingMarquee, setIsAddingMarquee] = useState(false);
  const [newMarqueeText, setNewMarqueeText] = useState('');

  useEffect(() => {
    fetchMarquees();
  }, []);

  const fetchMarquees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/marquee/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMarquees(response.data ? [response.data] : []);
    } catch (error) {
      console.error('Failed to fetch marquees:', error);
      toast.error('Failed to fetch marquees');
    }
  };

  const handleCreateMarquee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/marquee',
        { text: newMarqueeText },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setIsAddingMarquee(false);
      setNewMarqueeText('');
      fetchMarquees();
      toast.success('Marquee created successfully');
    } catch (error) {
      console.error('Failed to create marquee:', error);
      toast.error('Failed to create marquee');
    }
  };

  const handleDeleteMarquee = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/marquee/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMarquees();
      toast.success('Marquee deleted successfully');
    } catch (error) {
      console.error('Failed to delete marquee:', error);
      toast.error('Failed to delete marquee');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Marquee</h2>
        <button
          onClick={() => setIsAddingMarquee(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] transition-colors"
        >
          <Plus size={20} />
          Add Marquee
        </button>
      </div>

      {isAddingMarquee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#05111b] rounded-xl p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add New Marquee</h3>
              <button
                onClick={() => setIsAddingMarquee(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateMarquee} className="space-y-4">
              <div>
                <textarea
                  placeholder="Marquee Text"
                  value={newMarqueeText}
                  onChange={(e) => setNewMarqueeText(e.target.value)}
                  className="w-full px-4 py-2 bg-[#091c2f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2196F3] h-32 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsAddingMarquee(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2196F3] text-white rounded-lg hover:bg-[#1976D2] transition-colors"
                >
                  Create Marquee
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="space-y-4">
        {marquees.map((marquee) => (
          <motion.div
            key={marquee._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#05111b] rounded-xl p-6 shadow-lg"
          >
            <div className="flex justify-between items-start">
              <p className="text-white">{marquee.text}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setNewMarqueeText(marquee.text);
                    setIsAddingMarquee(true);
                  }}
                  className="text-gray-400 hover:text-[#2196F3] transition-colors"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => handleDeleteMarquee(marquee._id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default MarqueeManager;