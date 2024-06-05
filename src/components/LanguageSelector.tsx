import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === i18n.language);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);

    // LOG de DEBUG: rastrear cambios en el estado del menú desplegable
    console.debug("Estado del menú desplegable cambiado:", !isOpen);
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);

    // LOG de INFO: registro de cambio de idioma
    console.info("Se cambió el idioma:", langCode);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);

      // LOG de ERROR: el menú desplegable se cerró debido a un clic fuera del elemento
      console.error("Se cerró el menú desplegable debido a un clic fuera del componente");
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Nuevo LOG de ERROR: Manejo de error cuando el menú desplegable no se puede cerrar
  console.error("¡Error! No se puede cerrar el menú desplegable");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
      >
        <span className="mr-1">{currentLanguage?.flag}</span>
        <span className='font-orbitron'>{currentLanguage?.name}</span>
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
