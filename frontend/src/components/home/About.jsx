import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import image4 from "../../images/image4.jpg"

function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-4xl font-bold mb-6">ABOUT US</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
            We are a team of five students from PICT College, passionate about leveraging satellite imagery and machine learning to predict crop yields. Our goal is to provide farmers with accurate, data-driven insights to optimize farming practices and promote sustainable agriculture. Through innovation and technology, we aim to contribute to smarter, more efficient farming solutions worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.img
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              src="https://eiwgew27fhz.exactdn.com/wp-content/uploads/2023/02/home-about-1-300x200.jpg"
              alt="Golf facility"
              className="rounded-lg shadow-xl"
            />
            <motion.img
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              src={image4}
              alt="Golf course"
              className="rounded-lg shadow-xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default About;