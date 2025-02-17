import { Languages } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="fixed bottom-6 right-6 bg-blue-800 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 flex items-center gap-2"
    >
      <Languages size={20} />
      <span className="font-semibold">{language.toUpperCase()}</span>
    </button>
  );
}

export default LanguageToggle;