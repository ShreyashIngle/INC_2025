import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

function ChatMessage({ message, isBot }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {isBot && (
        <div className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          isBot ? 'bg-gray-800' : 'bg-green-800'
        }`}
      >
        <p className="text-white">{message}</p>
      </div>
      {!isBot && (
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
      )}
    </motion.div>
  );
}

export default ChatMessage;