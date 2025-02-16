import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Calendar, Info, ArrowRight } from 'lucide-react';
import schemes from '../../data/governmentSchemes.json';
import * as LucideIcons from 'lucide-react';

function GovernmentSchemes() {
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const SchemeCard = ({ scheme }) => {
    const IconComponent = LucideIcons[scheme.icon] || LucideIcons.Info; // Fallback to Info
  
    if (!LucideIcons[scheme.icon]) {
      console.warn(`Icon "${scheme.icon}" is not a valid Lucide icon.`);
    }
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-green-800 to-green-900 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <div className="flex items-start justify-between">
          <div className="p-3 bg-green-700/30 rounded-xl">
            <IconComponent className="w-8 h-8 text-green-400" />
          </div>
          <button
            onClick={() => {
              setSelectedScheme(scheme);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <span className="text-sm">Learn More</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
  
        <h3 className="text-xl font-bold mt-4 mb-2">{scheme.title}</h3>
        <p className="text-gray-300 line-clamp-3">{scheme.description}</p>
  
        <div className="mt-4 p-4 bg-black/20 rounded-xl">
          <div className="flex items-center gap-2 text-green-400">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">Key Benefits</span>
          </div>
          <p className="mt-2 text-sm text-gray-300">{scheme.benefits}</p>
        </div>
      </motion.div>
    );
  };
  

  const SchemeModal = ({ scheme, onClose }) => {
    if (!scheme) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-green-700/30 rounded-xl">
              <Info className="w-8 h-8 text-green-400" />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-4">{scheme.title}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">Description</h3>
              <p className="text-gray-300">{scheme.description}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">Benefits</h3>
              <p className="text-gray-300">{scheme.benefits}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">Achievements</h3>
              <p className="text-gray-300">{scheme.achievements}</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8"
      >
        Government Schemes
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.schemes.map((scheme) => (
          <SchemeCard key={scheme.id} scheme={scheme} />
        ))}
      </div>

      {isModalOpen && (
        <SchemeModal
          scheme={selectedScheme}
          onClose={() => {
            setSelectedScheme(null);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default GovernmentSchemes;