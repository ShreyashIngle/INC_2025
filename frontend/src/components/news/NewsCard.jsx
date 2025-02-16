import { motion } from 'framer-motion';
import { useState } from 'react';
import NewsDialog from './NewsDialog';

function NewsCard({ news }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-green-800 text-white px-3 py-1 rounded-full text-sm">
              {news.city}
            </span>
          </div>
          <h3
            onClick={() => setIsDialogOpen(true)}
            className="text-xl font-semibold mb-2 hover:text-green-500 cursor-pointer transition-colors"
          >
            {news.title}
          </h3>
          <p className="text-gray-400 line-clamp-3">
            {news.description.split('\n')[0]}
          </p>
        </div>
      </motion.div>

      <NewsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        news={news}
      />
    </>
  );
}

export default NewsCard;