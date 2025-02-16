import { useState } from 'react';
import { motion } from 'framer-motion';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I'm your agricultural assistant. How can I help you today?",
      isBot: true,
    },
  ]);

  const handleSendMessage = async (message) => {
    // Add user message
    setMessages((prev) => [...prev, { text: message, isBot: false }]);

    // Simulate bot response (replace with actual API call)
    setTimeout(() => {
      const botResponses = {
        crops: "Based on the current season and your location, I recommend growing wheat, corn, or soybeans. Would you like specific information about any of these crops?",
        weather: "The forecast shows favorable conditions for farming this week. Expect moderate rainfall and optimal temperatures for crop growth.",
        pests: "For natural pest control, consider companion planting or introducing beneficial insects. Would you like more specific pest management strategies?",
        default: "I'm here to help with any farming-related questions. Feel free to ask about crops, weather, pest control, or other agricultural topics.",
      };

      const keyword = Object.keys(botResponses).find((key) =>
        message.toLowerCase().includes(key)
      );
      const response = botResponses[keyword] || botResponses.default;

      setMessages((prev) => [...prev, { text: response, isBot: true }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen  bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-8"
        >
          Agricultural Assistant
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl shadow-xl p-6"
        >
          <div className="space-y-6 mb-6 max-h-[60vh] overflow-y-auto">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message.text}
                isBot={message.isBot}
              />
            ))}
          </div>

          <ChatInput onSendMessage={handleSendMessage} />
        </motion.div>
      </div>
    </div>
  );
}

export default Chatbot;