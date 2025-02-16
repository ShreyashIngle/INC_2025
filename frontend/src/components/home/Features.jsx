// import { motion } from 'framer-motion';
// import { useInView } from 'framer-motion';
// import { useRef } from 'react';
// import image1 from '../../images/image1.jpg';
// import image2 from '../../images/image2.jpg';
// import image3 from '../../images/image3.jpg';

// const features = [
//   {
//     title: 'Satellite Yield Prediction',
//     description: 'Experience the power of advanced satellite imagery and machine learning to accurately predict crop yields.',
//     image: image1
//   },
//   {
//     title: 'Crop Health Monitoring',
//     description: 'Monitor the health of your crops in real-time with high-resolution satellite data, ensuring optimal growth.',
//     image: image2
//   },
//   {
//     title: 'Precision Agriculture Solutions',
//     description: 'Leverage data-driven insights to make informed decisions, enhance farm productivity, and promote sustainability.',
//     image: image3
//   }
// ];

// function Features() {
//   const ref = useRef(null);
//   const isInView = useInView(ref, { once: true });

//   return (
//     <section ref={ref} className="py-24 bg-black">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {features.map((feature, index) => (
//             <motion.div
//               key={feature.title}
//               initial={{ opacity: 0, y: 50 }}
//               animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
//               transition={{ duration: 0.5, delay: index * 0.2 }}
//               className="group relative overflow-hidden rounded-2xl"
//             >
//               <div className="relative h-80 w-full overflow-hidden">
//                 <img
//                   src={feature.image}
//                   alt={feature.title}
//                   className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
//               </div>
              
//               <div className="absolute bottom-0 p-6 w-full">
//                 <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
//                 <p className="text-gray-300">{feature.description}</p>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

// export default Features;



import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import image1 from '../../images/image1.jpg';
import image2 from '../../images/image2.jpg';
import image3 from '../../images/image3.jpg';
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../utils/translations';

const features = [
  {
    title: 'Satellite Yield Prediction',
    description: 'Experience the power of advanced satellite imagery and machine learning to accurately predict crop yields.',
    image: image1
  },
  {
    title: 'Crop Health Monitoring',
    description: 'Monitor the health of your crops in real-time with high-resolution satellite data, ensuring optimal growth.',
    image: image2
  },
  {
    title: 'Precision Agriculture Solutions',
    description: 'Leverage data-driven insights to make informed decisions, enhance farm productivity, and promote sustainability.',
    image: image3
  }
];

function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { language } = useLanguage();
  const t = translations[language].features;

  return (
    <section ref={ref} className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className="relative h-80 w-full overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              
              <div className="absolute bottom-0 p-6 w-full">
                <h3 className="text-2xl font-bold mb-2">{t[feature.title]}</h3>
                <p className="text-gray-300">{t[feature.description]}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
