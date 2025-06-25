import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Menu, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { MenuCategory } from '../../types';

const CategoryManager: React.FC = () => {
  const { 
    selectedRestaurant,
    createCategory,
    updateCategory,
    deleteCategory,
    getRestaurantCategories,
    getCategoryItems
  } = useAppContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const categories = selectedRestaurant ? getRestaurantCategories(selectedRestaurant.id) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRestaurant) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      createCategory({
        restaurantId: selectedRestaurant.id,
        name: formData.name,
        description: formData.description,
        position: categories.length,
        isVisible: true
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: MenuCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = (category: MenuCategory) => {
    const itemCount = getCategoryItems(category.id).length;
    const message = itemCount > 0 
      ? `Are you sure you want to delete "${category.name}"? This will also delete ${itemCount} menu item(s).`
      : `Are you sure you want to delete "${category.name}"?`;
      
    if (window.confirm(message)) {
      deleteCategory(category.id);
    }
  };

  const toggleVisibility = (category: MenuCategory) => {
    updateCategory(category.id, { isVisible: !category.isVisible });
  };

  if (!selectedRestaurant) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Menu className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurant selected</h3>
          <p className="text-gray-500">Please select a restaurant first to manage categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Categories</h1>
          <p className="text-gray-600">Organize your menu with categories like Starters, Mains, Desserts</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Category Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Starters, Main Courses, Desserts"
                />
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
                  placeholder="Optional description for this category"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((category) => {
          const itemCount = getCategoryItems(category.id).length;
          
          return (
            <div
              key={category.id}
              className={`bg-white rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                category.isVisible ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="cursor-move text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      category.isVisible
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                        : 'bg-gray-300'
                    }`}>
                      <Menu className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        category.isVisible ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                        {!category.isVisible && ' • Hidden from menu'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleVisibility(category)}
                    className={`p-2 rounded-lg transition-colors ${
                      category.isVisible
                        ? 'text-green-600 bg-green-50 hover:bg-green-100'
                        : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                    }`}
                    title={category.isVisible ? 'Hide from menu' : 'Show in menu'}
                  >
                    {category.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {category.description && (
                <p className="mt-3 text-gray-600 text-sm ml-12">{category.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Menu className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-500 mb-6">Create your first category to organize your menu items.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Category
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;