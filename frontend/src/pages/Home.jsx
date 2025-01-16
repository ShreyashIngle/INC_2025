import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import About from '../components/home/About';
import Testimonials from '../components/home/Testimonials';
import CallToAction from '../components/home/CallToAction';
import InfiniteScroller from '../components/shared/InfiniteScroller';

const scrollItems = [
  'YIELD PREDICTIONS',
  'CROP HEALTH MONITORING',
  'SUSTAINABILITY INSIGHTS',
  'PRECISION FARMING',
  'SATELLITE DATA ANALYTICS',
];

function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden"
    >
      <Hero />
      <InfiniteScroller items={scrollItems} />
      <Features />
      <About />
      <Testimonials />
      <CallToAction />
    </motion.div>
  );
}

export default Home;