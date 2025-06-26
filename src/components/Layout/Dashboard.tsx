import React, { useState } from 'react';
import Sidebar from './Sidebar';
import RestaurantManager from '../Restaurant/RestaurantManager';
import CategoryManager from '../Menu/CategoryManager';
import MenuItemManager from '../Menu/MenuItemManager';
import PublicMenu from '../Menu/PublicMenu';
import Settings from './Settings';
import { useAppContext } from '../../contexts/AppContext';
import { Menu, X } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('restaurants');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { selectedRestaurant } = useAppContext();

  const renderActiveView = () => {
    switch (activeView) {
      case 'restaurants':
        return <RestaurantManager />;
      case 'categories':
        return <CategoryManager />;
      case 'menu-items':
        return <MenuItemManager />;
      case 'preview':
        return selectedRestaurant ? <PublicMenu restaurantId={selectedRestaurant.id} /> : <div className="p-8 text-center text-gray-400">Выберите ресторан для предпросмотра меню</div>;
      case 'settings':
        return <Settings />;
      default:
        return <RestaurantManager />;
    }
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    // Закрываем мобильное меню при смене вью
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Мобильная кнопка меню */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Мобильное меню (оверлей) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Затемнение */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Боковое меню */}
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl block">
            <div className="flex justify-end p-4">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
            <Sidebar activeView={activeView} setActiveView={handleViewChange} />
          </div>
        </div>
      )}

      {/* Десктопное меню */}
      <Sidebar activeView={activeView} setActiveView={handleViewChange} />

      {/* Основной контент */}
      <div className="flex-1 overflow-auto md:ml-0">
        {renderActiveView()}
      </div>
    </div>
  );
};

export default Dashboard;