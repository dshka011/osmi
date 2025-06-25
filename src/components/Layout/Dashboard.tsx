import React, { useState } from 'react';
import Sidebar from './Sidebar';
import RestaurantManager from '../Restaurant/RestaurantManager';
import CategoryManager from '../Menu/CategoryManager';
import MenuItemManager from '../Menu/MenuItemManager';
import PublicMenu from '../Menu/PublicMenu';
import Settings from './Settings';

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState('restaurants');

  const renderActiveView = () => {
    switch (activeView) {
      case 'restaurants':
        return <RestaurantManager />;
      case 'categories':
        return <CategoryManager />;
      case 'menu-items':
        return <MenuItemManager />;
      case 'preview':
        return <PublicMenu />;
      case 'settings':
        return <Settings />;
      default:
        return <RestaurantManager />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 overflow-auto">
        {renderActiveView()}
      </div>
    </div>
  );
};

export default Dashboard;