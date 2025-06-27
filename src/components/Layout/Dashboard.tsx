import React, { useState } from 'react';
import Sidebar from './Sidebar';
import BottomNavigation from './BottomNavigation';
import RestaurantSelector from './RestaurantSelector';
import RestaurantManager from '../Restaurant/RestaurantManager';
import CategoryManager from '../Menu/CategoryManager';
import MenuItemManager from '../Menu/MenuItemManager';
import PublicMenu from '../Menu/PublicMenu';
import Settings from './Settings';
import OrdersManager from '../Orders/OrdersManager';
import DashboardStats from '../Orders/DashboardStats';
import { useAppContext } from '../../contexts/AppContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useLanguage } from '../../contexts/LanguageContext';
import { Store, Menu, ListRestart as Restaurant, Eye, List } from 'lucide-react';
import { CartProvider } from '../../contexts/CartContext';

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
        return selectedRestaurant ? (
          <CartProvider>
            <PublicMenu restaurantId={selectedRestaurant.id} />
          </CartProvider>
        ) : <div className="p-8 text-center text-gray-400">{t('publicMenu.noRestaurant.description')}</div>;
      case 'orders':
        return <OrdersManager />;
      case 'settings':
        return <Settings />;
      default:
        return <RestaurantManager />;
    }
  };

  const navigationItems = [
    { id: 'restaurants', label: t('nav.restaurants'), icon: Store, badge: restaurants.length },
    { id: 'categories', label: t('nav.categories'), icon: Menu, disabled: !selectedRestaurant },
    { id: 'menu-items', label: t('nav.menuItems'), icon: Restaurant, disabled: !selectedRestaurant },
    { id: 'preview', label: t('nav.preview'), icon: Eye, disabled: !selectedRestaurant },
    { id: 'orders', label: 'Заказы', icon: List, disabled: !selectedRestaurant },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

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