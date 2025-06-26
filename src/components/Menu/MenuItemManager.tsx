import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Eye, EyeOff, GripVertical, DollarSign, Tag, Camera, X } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { MenuItem, MenuCategory } from '../../types';

const MenuItemManager: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotifications();
  const { 
    selectedRestaurant,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getRestaurantCategories,
    getCategoryItems,
    formatPrice
  } = useAppContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    tags: '',
    categoryId: '',
    image: ''
  });

  const categories = selectedRestaurant ? getRestaurantCategories(selectedRestaurant.id) : [];
  const visibleCategories = categories.filter(cat => cat.isVisible);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRestaurant) return;

    const categoryId = formData.categoryId || selectedCategory;
    if (!categoryId) return;

    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    const existingItems = getCategoryItems(categoryId);

    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, {
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          image: formData.image || undefined
        });
        showSuccess('Блюдо обновлено', 'Блюдо успешно обновлено');
      } else {
        await createMenuItem({
          categoryId,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          image: formData.image || undefined,
          isVisible: true,
          position: existingItems.length
        });
        showSuccess('Блюдо добавлено', 'Блюдо успешно добавлено в меню');
      }
      
      resetForm();
    } catch (error) {
      showError('Ошибка сохранения', error instanceof Error ? error.message : 'Не удалось сохранить блюдо');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', tags: '', categoryId: '', image: '' });
    setImagePreview('');
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      tags: item.tags.join(', '),
      categoryId: item.categoryId,
      image: item.image || ''
    });
    setImagePreview(item.image || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (item: MenuItem) => {
    if (window.confirm(t('menuItem.delete.confirm', { name: item.name }))) {
      try {
        await deleteMenuItem(item.id);
        showSuccess('Блюдо удалено', 'Блюдо успешно удалено из меню');
      } catch (error) {
        showError('Ошибка удаления', error instanceof Error ? error.message : 'Не удалось удалить блюдо');
      }
    }
  };

  const toggleVisibility = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.id, { isVisible: !item.isVisible });
      showSuccess(
        item.isVisible ? 'Блюдо скрыто' : 'Блюдо показано',
        item.isVisible ? 'Блюдо скрыто из публичного меню' : 'Блюдо добавлено в публичное меню'
      );
    } catch (error) {
      showError('Ошибка изменения видимости', error instanceof Error ? error.message : 'Не удалось изменить видимость блюда');
    }
  };

  const openAddForm = (categoryId?: string) => {
    setFormData({ name: '', description: '', price: '', tags: '', categoryId: categoryId || '', image: '' });
    setImagePreview('');
    setIsFormOpen(true);
  };

  if (!selectedRestaurant) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('menuItem.noRestaurant')}</h3>
          <p className="text-gray-500">{t('menuItem.noRestaurant.description')}</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('menuItem.noCategories')}</h3>
          <p className="text-gray-500">{t('menuItem.noCategories.description')}</p>
        </div>
      </div>
    );
  }

  const currency = selectedRestaurant.currency || 'RUB';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('menuItem.title')}</h1>
          <p className="text-gray-600">{t('menuItem.subtitle')}</p>
        </div>
        <button
          onClick={() => openAddForm()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('menuItem.add')}
        </button>
      </div>

      {/* Menu Item Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingItem ? t('menuItem.edit') : t('menuItem.create')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('menuItem.category.required')}
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('menuItem.category.select')}</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('menuItem.name.required')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Margherita Pizza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo
                </label>
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">{t('menuItem.photo.description')}</p>
                      <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                        <Camera className="w-4 h-4 mr-2" />
                        Choose Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder={t('menuItem.description.placeholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('menuItem.price.required', { currency })}
                </label>
                <input
                  type="number"
                  step={currency === 'RUB' ? '1' : '0.01'}
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currency === 'RUB' ? '500' : '0.00'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('common.tags')}
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('menuItem.tags.placeholder')}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingItem ? t('menuItem.update') : t('menuItem.create')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Items by Category */}
      <div className="space-y-8">
        {categories.map((category) => {
          const items = getCategoryItems(category.id);
          
          return (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                    <span className="text-sm text-gray-500">
                      {items.length === 1 ? t('category.items.single', { count: items.length }) : t('category.items', { count: items.length })}
                    </span>
                    {!category.isVisible && (
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                        {t('category.hiddenFromMenu')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => openAddForm(category.id)}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {t('menuItem.addToCategory')}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-6 transition-all duration-200 hover:bg-gray-50 ${
                      !item.isVisible ? 'bg-gray-25' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="cursor-move text-gray-400 hover:text-gray-600 mt-1">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        
                        {item.image && (
                          <div className="w-20 h-20 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`font-medium ${
                              item.isVisible ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {item.name}
                            </h3>
                            <span className={`font-semibold ${
                              item.isVisible ? 'text-emerald-600' : 'text-gray-400'
                            }`}>
                              {formatPrice(item.price, currency)}
                            </span>
                            {!item.isVisible && (
                              <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                                {t('common.hidden')}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className={`text-sm mb-3 ${
                              item.isVisible ? 'text-gray-600' : 'text-gray-400'
                            }`}>
                              {item.description}
                            </p>
                          )}
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                                    item.isVisible
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-500'
                                  }`}
                                >
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleVisibility(item)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.isVisible
                              ? 'text-green-600 bg-green-50 hover:bg-green-100'
                              : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                          }`}
                          title={item.isVisible ? t('category.hideFromMenu') : t('category.showInMenu')}
                        >
                          {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 text-sm">{t('menuItem.noItems')}</p>
                    <button
                      onClick={() => openAddForm(category.id)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {t('menuItem.addFirst')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuItemManager;