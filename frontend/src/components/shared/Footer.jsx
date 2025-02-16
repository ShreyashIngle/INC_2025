// import { motion } from 'framer-motion';
// import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
// import logo from "../../images/logo.jpg"

// function Footer() {
//   return (
//     <footer className="bg-gradient-to-b from-green-900 to-black py-16">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
//           <div>
//             <img
//               src={logo}
//               alt="Logo"
//               className="h-12 mb-6"
//             />
//             <p className="text-gray-300">
//             Making yield prediction and farming insights accessible to everyone.
//             </p>
//           </div>

//           <div>
//             <h3 className="text-xl font-bold mb-4">Quick Links</h3>
//             <ul className="space-y-2">
//               {['Satellite Yield Prediction', 'Crop Health Monitoring', 'Precision Agriculture Solutions'].map((item) => (
//                 <li key={item}>
//                   <motion.a
//                     href="#"
//                     whileHover={{ x: 5 }}
//                     className="text-gray-300 hover:text-white transition-colors"
//                   >
//                     {item}
//                   </motion.a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h3 className="text-xl font-bold mb-4">Contact</h3>
//             <ul className="space-y-4">
//               <li className="flex items-center text-gray-300">
//                 <MapPin className="mr-2" size={20} />
//                 PICT, Pune
//               </li>
//               <li className="flex items-center text-gray-300">
//                 <Phone className="mr-2" size={20} />
//                 0208 309 0181
//               </li>
//               <li className="flex items-center text-gray-300">
//                 <Mail className="mr-2" size={20} />
//                 info@yieldivision.com
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="text-xl font-bold mb-4">Follow Us</h3>
//             <div className="flex space-x-4">
//               {[Facebook, Twitter, Instagram].map((Icon, index) => (
//                 <motion.a
//                   key={index}
//                   href="#"
//                   whileHover={{ y: -5 }}
//                   className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"
//                 >
//                   <Icon size={24} />
//                 </motion.a>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
//           <p>&copy; {new Date().getFullYear()} yieldivision. All rights reserved.</p>
//         </div>
//       </div>
//     </footer>
//   );
// }

// export default Footer;


import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import logo from "../../images/logo.png";
import { useLanguage } from '../../contexts/LanguageContext';
import { translations } from '../../utils/translations';

function Footer() {
  const { language } = useLanguage();
  const t = translations[language].footer;

  return (
    <footer className="bg-gradient-to-b from-green-900 to-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <img
              src={logo}
              alt="Logo"
              className="h-12 mb-6"
            />
            <p className="text-gray-300">
              {t.description}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">{t.quickLinks}</h3>
            <ul className="space-y-2">
              {['Satellite Yield Prediction', 'Crop Health Monitoring', 'Precision Agriculture Solutions'].map((item) => (
                <li key={item}>
                  <motion.a
                    href="#"
                    whileHover={{ x: 5 }}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">{t.contact}</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-300">
                <MapPin className="mr-2" size={20} />
                PICT, Pune
              </li>
              <li className="flex items-center text-gray-300">
                <Phone className="mr-2" size={20} />
                0208 309 0181
              </li>
              <li className="flex items-center text-gray-300">
                <Mail className="mr-2" size={20} />
                info@yieldivision.com
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">{t.followUs}</h3>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ y: -5 }}
                  className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Icon size={24} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} yieldivision. {t.allRightsReserved}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
