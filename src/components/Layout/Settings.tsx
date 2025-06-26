import React, { useState, useEffect, useRef } from 'react';
import { Globe, Monitor, Bell, Database, Info, Check, ChevronRight } from 'lucide-react';
import { useLanguage, Language } from '../../contexts/LanguageContext';

const Settings: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    if (showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageDropdown]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setShowLanguageDropdown(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const languages = [
    { code: 'ru' as Language, name: t('settings.language.russian'), flag: '🇷🇺' },
    { code: 'en' as Language, name: t('settings.language.english'), flag: '🇺🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const settingsSections = [
    {
      id: 'language',
      title: t('settings.language'),
      description: t('settings.language.description'),
      icon: Globe,
      content: (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{currentLanguage?.flag}</span>
              <span className="font-medium text-gray-900">{currentLanguage?.name}</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
              showLanguageDropdown ? 'rotate-90' : ''
            }`} />
          </button>

          {showLanguageDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999]">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-medium text-gray-900">{lang.name}</span>
                  </div>
                  {language === lang.code && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      id: 'appearance',
      title: t('settings.appearance'),
      description: t('settings.appearance.description'),
      icon: Monitor,
      content: (
        <div className="text-sm text-gray-500">
          {t('settings.appearance.description')} (Coming soon)
        </div>
      )
    },
    {
      id: 'notifications',
      title: t('settings.notifications'),
      description: t('settings.notifications.description'),
      icon: Bell,
      content: (
        <div className="text-sm text-gray-500">
          {t('settings.notifications.description')} (Coming soon)
        </div>
      )
    },
    {
      id: 'data',
      title: t('settings.data'),
      description: t('settings.data.description'),
      icon: Database,
      content: (
        <div className="text-sm text-gray-500">
          {t('settings.data.description')} (Coming soon)
        </div>
      )
    },
    {
      id: 'about',
      title: t('settings.about'),
      description: t('settings.about.description'),
      icon: Info,
      content: (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">O</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t('app.title')}</h3>
              <p className="text-sm text-gray-500">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {t('publicMenu.platform')}
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-600">{t('settings.subtitle')}</p>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-700 font-medium">{t('settings.saved')}</span>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          
          return (
            <div key={section.id} className="bg-white rounded-xl border border-gray-200">
              <div className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {section.description}
                    </p>
                  </div>
                </div>
                
                <div className="ml-14">
                  {section.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;