import React from 'react';
import { Store, Menu, ListRestart as Restaurant, Eye, Settings } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface BottomNavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
  onRestaurantSelect: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeView,
  setActiveView,
  onRestaurantSelect,
}) => {
  const { selectedRestaurant, restaurants } = useAppContext();
  const { t } = useLanguage();

  const navigationItems = [
    {
      id: 'restaurants',
      label: t('nav.restaurants'),
      icon: Store,
      badge: restaurants.length,
      disabled: false,
    },
    {
      id: 'categories',
      label: t('nav.categories'),
      icon: Menu,
      disabled: !selectedRestaurant,
    },
    {
      id: 'menu-items',
      label: t('nav.menuItems'),
      icon: Restaurant,
      disabled: !selectedRestaurant,
    },
    {
      id: 'preview',
      label: t('nav.preview'),
      icon: Eye,
      disabled: !selectedRestaurant,
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      icon: Settings,
      disabled: false,
    },
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === 'restaurants') {
      onRestaurantSelect();
    } else {
      setActiveView(itemId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && handleItemClick(item.id)}
              disabled={isDisabled}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : isDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge !== undefined && (
                  <span
                    className={`absolute -top-1 -right-1 w-4 h-4 text-xs rounded-full flex items-center justify-center ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation; 