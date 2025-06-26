import React, { useState, useEffect } from 'react';
import { X, Store, Plus, Search, Check } from 'lucide-react';
import { Restaurant } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface RestaurantSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRestaurant: Restaurant | null;
  restaurants: Restaurant[];
  onSelect: (restaurant: Restaurant) => void;
}

const RestaurantSelector: React.FC<RestaurantSelectorProps> = ({
  isOpen,
  onClose,
  selectedRestaurant,
  restaurants,
  onSelect,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Блокируем скролл при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRestaurantSelect = (restaurant: Restaurant) => {
    onSelect(restaurant);
    setSearchQuery('');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{t('restaurant.selectRestaurant')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('restaurantSelector.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Restaurant List */}
        <div className="overflow-y-auto max-h-96">
          {filteredRestaurants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery ? t('restaurantSelector.notFound') : t('restaurant.noRestaurants')}
            </div>
          ) : (
            <div className="p-2">
              {filteredRestaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => handleRestaurantSelect(restaurant)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    selectedRestaurant?.id === restaurant.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {restaurant.logo ? (
                    <img
                      src={restaurant.logo}
                      alt={`${restaurant.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Store className="w-6 h-6 text-emerald-600" />
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
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              // TODO: Добавить создание нового ресторана
              console.log('Create new restaurant');
            }}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('restaurant.add')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSelector; 