import React from 'react';
import { useIntl } from 'react-intl';

const LanguageSelector: React.FC = () => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = React.useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const currentLanguage = languages.find(
    (lang) => lang.code === intl.locale
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (langCode: string) => {
    // Dispatch an action or call a function to change the language
    // For example, using Redux:
    // dispatch(changeLanguage(langCode));
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
      >
        <span className="mr-1">{currentLanguage?.flag}</span>
        <span>{currentLanguage?.name}</span>
      </button>
      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5"
          style={{ zIndex: 1000 }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
            >
              <span className="mr-1">{lang.flag}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;