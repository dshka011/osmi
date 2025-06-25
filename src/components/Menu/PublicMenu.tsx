import React from 'react';
import { MapPin, Phone, Mail, Globe, Clock, Tag } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const PublicMenu: React.FC = () => {
  const { 
    selectedRestaurant,
    getRestaurantCategories,
    getCategoryItems,
    formatPrice,
    formatWorkingHours
  } = useAppContext();

  if (!selectedRestaurant) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurant selected</h3>
          <p className="text-gray-500">Please select a restaurant first to preview the menu.</p>
        </div>
      </div>
    );
  }

  const categories = getRestaurantCategories(selectedRestaurant.id).filter(cat => cat.isVisible);
  const currency = selectedRestaurant.currency || 'RUB';
  
  if (categories.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No menu available</h3>
          <p className="text-gray-500">Add some categories and menu items to see the public menu preview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Restaurant Photo */}
          {selectedRestaurant.photo && (
            <div className="mb-6">
              <img
                src={selectedRestaurant.photo}
                alt={selectedRestaurant.name}
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
            </div>
          )}

          <div className="text-center mb-6">
            {selectedRestaurant.logo ? (
              <img
                src={selectedRestaurant.logo}
                alt={`${selectedRestaurant.name} logo`}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">
                  {selectedRestaurant.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedRestaurant.name}
            </h1>
            {selectedRestaurant.description && (
              <p className="text-lg text-gray-600 mb-4">
                {selectedRestaurant.description}
              </p>
            )}
          </div>

          {/* Restaurant Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {selectedRestaurant.address && (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{selectedRestaurant.address}</span>
              </div>
            )}
            {selectedRestaurant.phone && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{selectedRestaurant.phone}</span>
              </div>
            )}
            {selectedRestaurant.email && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>{selectedRestaurant.email}</span>
              </div>
            )}
            {selectedRestaurant.website && (
              <div className="flex items-center space-x-2 text-gray-600">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>{selectedRestaurant.website}</span>
              </div>
            )}
            {selectedRestaurant.workingHours && (
              <div className="flex items-start space-x-2 text-gray-600 md:col-span-2">
                <Clock className="w-4 h-4 text-emerald-600 mt-0.5" />
                <span className="leading-relaxed">{formatWorkingHours(selectedRestaurant.workingHours)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {categories.map((category) => {
            const items = getCategoryItems(category.id).filter(item => item.isVisible);
            
            if (items.length === 0) return null;

            return (
              <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">{category.name}</h2>
                  {category.description && (
                    <p className="text-emerald-100 text-sm mt-1">{category.description}</p>
                  )}
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900 flex-1">
                              {item.name}
                            </h3>
                            <span className="text-lg font-semibold text-emerald-600 ml-4">
                              {formatPrice(item.price, currency)}
                            </span>
                          </div>
                          
                          {item.description && (
                            <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-full"
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {item.image && (
                          <div className="w-32 h-32 flex-shrink-0 ml-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg shadow-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Powered by <span className="font-semibold text-emerald-600">Osmi</span> - Digital Menu Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicMenu;