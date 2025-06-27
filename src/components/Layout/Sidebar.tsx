import React, { useState } from 'react';
import { ListRestart as Restaurant, Store, Menu, Eye, Settings, ChevronDown, Check, LogOut, List } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import osmiLogo from '../../assets/osmi_logo_2.svg';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { selectedRestaurant, restaurants, selectRestaurant } = useAppContext();
  const { t } = useLanguage();
  const { signOut, user } = useAuth();
  const [isRestaurantDropdownOpen, setIsRestaurantDropdownOpen] = useState(false);

  const navigationItems = [
    { id: 'restaurants', label: t('nav.restaurants'), icon: Store, badge: restaurants.length },
    { id: 'categories', label: t('nav.categories'), icon: Menu, disabled: !selectedRestaurant },
    { id: 'menu-items', label: t('nav.menuItems'), icon: Restaurant, disabled: !selectedRestaurant },
    { id: 'preview', label: t('nav.preview'), icon: Eye, disabled: !selectedRestaurant },
    { id: 'orders', label: 'Заказы', icon: List, disabled: !selectedRestaurant },
  ];

  const handleRestaurantSelect = (restaurant: any) => {
    selectRestaurant(restaurant);
    setIsRestaurantDropdownOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img src={osmiLogo} alt="Osmi Logo" className="w-10 h-10 rounded-lg object-contain" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-girlo uppercase">{t('app.title')}</h1>
            <p className="text-sm text-gray-500">{t('app.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Restaurant Switcher */}
      {restaurants.length > 0 && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="relative">
            <button
              onClick={() => setIsRestaurantDropdownOpen(!isRestaurantDropdownOpen)}
              className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {selectedRestaurant ? (
                  <>
                    {selectedRestaurant.logo ? (
                      <img
                        src={selectedRestaurant.logo}
                        alt={`${selectedRestaurant.name} logo`}
                        className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Store className="w-4 h-4 text-emerald-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {selectedRestaurant.name}
                      </p>
                      <p className="text-xs text-gray-500">{t('restaurant.activeRestaurant')}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Store className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-500">
                        {t('restaurant.selectRestaurant')}
                      </p>
                      <p className="text-xs text-gray-400">{t('restaurant.selectRestaurant.description')}</p>
                    </div>
                  </>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                isRestaurantDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Dropdown Menu */}
            {isRestaurantDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    onClick={() => handleRestaurantSelect(restaurant)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {restaurant.logo ? (
                      <img
                        src={restaurant.logo}
                        alt={`${restaurant.name} logo`}
                        className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Store className="w-4 h-4 text-emerald-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {restaurant.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {restaurant.description || t('restaurant.noDescription')}
                      </p>
                    </div>
                    {selectedRestaurant?.id === restaurant.id && (
                      <Check className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                ))}
                
                {restaurants.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {t('restaurant.noRestaurants')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setActiveView(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : isDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* Settings Button */}
        <button 
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === 'settings'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>{t('nav.settings')}</span>
        </button>

        {/* User Info */}
        {user && (
          <div className="px-3 py-2 text-xs text-gray-500">
            <p className="font-medium">{user.email}</p>
          </div>
        )}

        {/* Sign Out Button */}
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;