import React, { useState } from 'react';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import RestaurantSelector from './RestaurantSelector';
import RestaurantManager from '../Restaurant/RestaurantManager';
import CategoryManager from '../Menu/CategoryManager';
import MenuItemManager from '../Menu/MenuItemManager';
import PublicMenu from '../Menu/PublicMenu';
import Settings from './Settings';
import { useAppContext } from '../../contexts/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useLanguage } from '../../contexts/LanguageContext';

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('restaurants');
  const [isRestaurantModalOpen, setIsRestaurantModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const { selectedRestaurant, restaurants, selectRestaurant } = useAppContext();
  const { t } = useLanguage();

  const renderActiveView = () => {
    switch (activeView) {
      case 'restaurants':
        return <RestaurantManager />;
      case 'categories':
        return <CategoryManager />;
      case 'menu-items':
        return <MenuItemManager />;
      case 'preview':
        return selectedRestaurant ? <PublicMenu restaurantId={selectedRestaurant.id} /> : <div className="p-8 text-center text-gray-400">{t('publicMenu.noRestaurant.description')}</div>;
      case 'settings':
        return <Settings />;
      default:
        return <RestaurantManager />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Десктоп: Sidebar */}
      {!isMobile && (
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
      )}
      
      {/* Основной контент */}
      <div className={`flex-1 overflow-auto ${isMobile ? 'pb-16' : ''}`}>
        {renderActiveView()}
      </div>
      
      {/* Мобильные: нижняя навигация */}
      {isMobile && (
        <BottomNavigation 
          activeView={activeView}
          setActiveView={setActiveView}
          onRestaurantSelect={() => setIsRestaurantModalOpen(true)}
        />
      )}
      
      {/* Модальное окно выбора ресторана */}
      {isMobile && (
        <RestaurantSelector
          isOpen={isRestaurantModalOpen}
          onClose={() => setIsRestaurantModalOpen(false)}
          selectedRestaurant={selectedRestaurant}
          restaurants={restaurants}
          onSelect={(restaurant) => {
            selectRestaurant(restaurant);
            setIsRestaurantModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;