import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

function Hero() {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://sidcupfamilygolf.com/wp-content/uploads/2023/02/hero.mp4"
          type="video/mp4"
        />
      </video>
      
      <div className="absolute inset-0 bg-black/40 z-10" />
      
      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-6xl font-bold mb-6"
        >
          PREDICT. GROW. HARVEST.
        </motion.h1>
        
        <motion.h2
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-2xl sm:text-4xl font-semibold mb-8"
        >
          WELCOME TO YIELDVISION!
        </motion.h2>
        
        <motion.p
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-200"
        >
          At YieldVision, we combine cutting-edge satellite imagery with advanced machine learning to provide accurate yield predictions for farmers worldwide. Our platform uses real-time satellite data to forecast crop yields, optimize farming practices, and increase productivity. 
        </motion.p>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            <ArrowDown size={48} className="text-white/80" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Hero;