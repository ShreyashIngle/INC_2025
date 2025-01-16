import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Quote } from 'lucide-react';

function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center relative"
        >
          <Quote
            size={48}
            className="absolute -top-12 -left-12 text-green-500 opacity-50"
          />
          
          <motion.p
            initial={{ y: 20 }}
            animate={isInView ? { y: 0 } : { y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-300 leading-relaxed"
          >
            Using YieldVision has revolutionized the way we approach farming. The accurate yield predictions and real-time data have helped us optimize our crops and improve overall productivity. It's an invaluable tool that makes farming smarter and more sustainable
          </motion.p>
          
          <Quote
            size={48}
            className="absolute -bottom-12 -right-12 text-green-500 opacity-50"
          />
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;