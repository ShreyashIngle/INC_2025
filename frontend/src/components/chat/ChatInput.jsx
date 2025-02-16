import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useState } from 'react';

function ChatInput({ onSendMessage }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about farming, crops, or agricultural practices..."
          className="w-full px-6 py-4 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 pr-16"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-800 p-3 rounded-xl hover:bg-green-700 transition-colors"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </form>
  );
}

export default ChatInput;