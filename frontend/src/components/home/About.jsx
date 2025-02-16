import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../utils/translations';
import image4 from "../../images/image4.jpg";

function About() {
  const { language } = useLanguage();
  const t = translations[language].about.newAbout; // Access the "newAbout" section from translations

  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-4xl font-bold mb-6">{t.title}</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              {t.content}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.img
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              src="https://eiwgew27fhz.exactdn.com/wp-content/uploads/2023/02/home-about-1-300x200.jpg"
              alt={t.images?.alt1}
              className="rounded-lg shadow-xl"
            />
            <motion.img
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              src={image4}
              alt={t.images?.alt2}
              className="rounded-lg shadow-xl"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default About;
