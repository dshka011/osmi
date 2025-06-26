import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import QRCode from 'qrcode';
import { AppContextType, Restaurant, MenuCategory, MenuItem, CURRENCIES, DEFAULT_WORKING_HOURS, WorkingHours, DAY_NAMES } from '../types';
import supabase from '../supabaseClient';
import { useAuth } from './AuthContext';

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функции для преобразования данных из Supabase в формат фронта
  function mapCategoryFromDb(db: any): MenuCategory {
    return {
      id: db.id,
      restaurantId: db.restaurant_id,
      name: db.name,
      description: db.description,
      position: db.position,
      isVisible: db.is_visible,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }
  function mapItemFromDb(db: any): MenuItem {
    return {
      id: db.id,
      categoryId: db.category_id,
      name: db.name,
      description: db.description,
      price: db.price,
      image: db.image,
      tags: db.tags,
      isVisible: db.is_visible,
      position: db.position,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }
  function mapRestaurantFromDb(db: any): Restaurant {
    return {
      id: db.id,
      name: db.name,
      description: db.description,
      logo: db.logo,
      photo: db.photo,
      phone: db.phone,
      email: db.email,
      address: db.address,
      website: db.website,
      currency: db.currency,
      workingHours: db.working_hours,
      createdAt: new Date(db.created_at),
      updatedAt: new Date(db.updated_at),
    };
  }

  // Функция для создания тестовых данных
  async function createDemoRestaurant(userId: string) {
    // 1. Создаём ресторан
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .insert([
        {
          name: 'Demo Bella Vista',
          description: 'Пример итальянского ресторана с аутентичной кухней',
          logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop',
          photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
          phone: '+7 (495) 000-00-00',
          email: 'demo@bellavista.ru',
          address: 'ул. Примерная, 1, Москва',
          website: 'https://demo.bellavista.ru',
          currency: 'RUB',
          working_hours: {
            monday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
            tuesday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
            wednesday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
            thursday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
            friday: { isOpen: true, openTime: '11:00', closeTime: '00:00' },
            saturday: { isOpen: true, openTime: '12:00', closeTime: '00:00' },
            sunday: { isOpen: true, openTime: '12:00', closeTime: '22:00' }
          },
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select();
    if (restaurantError || !restaurantData || !restaurantData[0]) return;
    const restaurantId = restaurantData[0].id;

    // 2. Создаём категории
    const categories = [
      { name: 'Закуски', description: 'Традиционные итальянские закуски', position: 0 },
      { name: 'Основные блюда', description: 'Паста, пицца и другие блюда', position: 1 },
      { name: 'Десерты', description: 'Сладкие завершения', position: 2 },
      { name: 'Напитки', description: 'Вина, кофе и напитки', position: 3 },
    ];
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('menu_categories')
      .insert(categories.map((cat, i) => ({
        ...cat,
        restaurant_id: restaurantId,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })))
      .select();
    if (categoriesError || !categoriesData) return;

    // 3. Создаём блюда
    const catIds = categoriesData.map((cat: any) => cat.id);
    const menuItems = [
      // Закуски
      { category: 0, name: 'Брускетта с томатами', description: 'Хрустящий хлеб с томатами и базиликом', price: 450, tags: ['вегетарианское'], image: '', position: 0 },
      { category: 0, name: 'Карпаччо из говядины', description: 'Говядина с рукколой и пармезаном', price: 890, tags: [], image: '', position: 1 },
      // Основные блюда
      { category: 1, name: 'Паста Карбонара', description: 'Спагетти с беконом и пармезаном', price: 750, tags: [], image: '', position: 0 },
      { category: 1, name: 'Пицца Маргарита', description: 'Пицца с томатами и моцареллой', price: 650, tags: ['вегетарианское'], image: '', position: 1 },
      // Десерты
      { category: 2, name: 'Тирамису', description: 'Классический итальянский десерт', price: 420, tags: [], image: '', position: 0 },
      { category: 2, name: 'Панна котта', description: 'Десерт с ягодным соусом', price: 380, tags: ['без глютена'], image: '', position: 1 },
      // Напитки
      { category: 3, name: 'Эспрессо', description: 'Крепкий итальянский кофе', price: 180, tags: [], image: '', position: 0 },
      { category: 3, name: 'Кьянти Классико', description: 'Красное вино из Тосканы (бокал)', price: 450, tags: [], image: '', position: 1 },
    ];
    await supabase.from('menu_items').insert(menuItems.map(item => ({
      category_id: catIds[item.category],
      name: item.name,
      description: item.description,
      price: item.price,
      tags: item.tags,
      image: item.image,
      is_visible: true,
      position: item.position,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })));
  }

  // Загрузка всех данных при запуске
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Рестораны только текущего пользователя
        const { data: restaurantsData, error: restaurantsError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('user_id', user.id);
        if (restaurantsError) throw restaurantsError;
        let allRestaurants: any[] = [];
        if (!restaurantsData || restaurantsData.length === 0) {
          await createDemoRestaurant(user.id);
          // Повторно загружаем рестораны
          const { data: demoRestaurants } = await supabase
            .from('restaurants')
            .select('*')
            .eq('user_id', user.id);
          const demoRestaurantsWithFixedImages = (demoRestaurants || []).map(restaurant => ({
            ...restaurant,
            logo: restaurant.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop',
            photo: restaurant.photo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
          }));
          setRestaurants(demoRestaurantsWithFixedImages.map(mapRestaurantFromDb));
          allRestaurants = demoRestaurantsWithFixedImages;
        } else {
          const restaurantsWithFixedImages = (restaurantsData || []).map(restaurant => ({
            ...restaurant,
            logo: restaurant.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop',
            photo: restaurant.photo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
          }));
          setRestaurants(restaurantsWithFixedImages.map(mapRestaurantFromDb));
          allRestaurants = restaurantsWithFixedImages;
        }
        // Категории
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('*');
        if (categoriesError) throw categoriesError;
        setCategories((categoriesData || []).map(mapCategoryFromDb));
        // Пункты меню
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('menu_items')
          .select('*');
        if (menuItemsError) throw menuItemsError;
        const menuItemsWithFixedImages = (menuItemsData || []).map(item => ({
          ...item,
          image: item.image || getDefaultFoodImage(item.name)
        }));
        setMenuItems(menuItemsWithFixedImages.map(mapItemFromDb));
        // По умолчанию выбираем первый ресторан
        if (allRestaurants.length > 0) {
          setSelectedRestaurant(mapRestaurantFromDb(allRestaurants[0]));
        }
      } catch (e: any) {
        setError(e.message || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Функция для получения картинки по умолчанию в зависимости от названия блюда
  const getDefaultFoodImage = (dishName: string): string => {
    const name = dishName.toLowerCase();
    if (name.includes('паста') || name.includes('спагетти')) {
      return 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop';
    }
    if (name.includes('пицца')) {
      return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop';
    }
    if (name.includes('ризотто')) {
      return 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop';
    }
    if (name.includes('десерт') || name.includes('тирамису') || name.includes('панна')) {
      return 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop';
    }
    if (name.includes('кофе') || name.includes('эспрессо')) {
      return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop';
    }
    if (name.includes('вино') || name.includes('кьянти')) {
      return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop';
    }
    if (name.includes('закуск') || name.includes('брускетт') || name.includes('карпаччо')) {
      return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop';
    }
    // Дефолтная картинка еды
    return 'https://images.unsplash.com/photo-1504674900240-9c69d7b3c8e3?w=400&h=300&fit=crop';
  };

  // CRUD для ресторанов
  const createRestaurant = async (restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Пользователь не авторизован');
    const dbData = {
      ...restaurantData,
      user_id: user.id,
      working_hours: restaurantData.workingHours,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (Object.prototype.hasOwnProperty.call(dbData, 'workingHours')) delete dbData.workingHours;
    const { data, error } = await supabase
      .from('restaurants')
      .insert([dbData])
      .select();
    if (error) throw error;
    setRestaurants(prev => [...prev, ...(data || []).map(mapRestaurantFromDb)]);
  };

  const updateRestaurant = async (id: string, updates: Partial<Restaurant>) => {
    const dbUpdates: any = { ...updates };
    if ('workingHours' in updates) {
      dbUpdates.working_hours = updates.workingHours;
      delete dbUpdates.workingHours;
    }
    const { data, error } = await supabase
      .from('restaurants')
      .update(dbUpdates)
      .eq('id', id)
      .select();
    if (error) throw error;
    setRestaurants(prev => prev.map(r => (r.id === id ? mapRestaurantFromDb(data[0]) : r)));
    if (selectedRestaurant?.id === id && data && data[0]) {
      setSelectedRestaurant(mapRestaurantFromDb(data[0]));
    }
  };

  const deleteRestaurant = async (id: string) => {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setRestaurants(prev => prev.filter(r => r.id !== id));
    setCategories(prev => prev.filter(c => c.restaurantId !== id));
    setMenuItems(prev => prev.filter(item => {
      const category = categories.find(cat => cat.id === item.categoryId);
      return category?.restaurantId !== id;
    }));
    if (selectedRestaurant?.id === id) {
      setSelectedRestaurant(null);
    }
  };

  const selectRestaurant = (restaurant: Restaurant | null) => {
    setSelectedRestaurant(restaurant);
    setSelectedCategory(null);
  };

  // CRUD для категорий
  const createCategory = async (categoryData: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Преобразуем поля для базы
    const dbData: any = {
      ...categoryData,
      restaurant_id: categoryData.restaurantId,
      is_visible: categoryData.isVisible,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Удаляем лишние поля
    delete dbData.restaurantId;
    delete dbData.isVisible;
    const { data, error } = await supabase
      .from('menu_categories')
      .insert([dbData])
      .select();
    if (error) throw error;
    setCategories(prev => [...prev, ...(data || []).map(mapCategoryFromDb)]);
  };

  const updateCategory = async (id: string, updates: Partial<MenuCategory>) => {
    const dbUpdates: any = { ...updates };
    if ('restaurantId' in updates) {
      dbUpdates.restaurant_id = updates.restaurantId;
      delete dbUpdates.restaurantId;
    }
    if ('isVisible' in updates) {
      dbUpdates.is_visible = updates.isVisible;
      delete dbUpdates.isVisible;
    }
    if ('createdAt' in updates) delete dbUpdates.createdAt;
    if ('updatedAt' in updates) dbUpdates.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('menu_categories')
      .update(dbUpdates)
      .eq('id', id)
      .select();
    if (error) throw error;
    setCategories(prev => prev.map(c => (c.id === id ? mapCategoryFromDb(data[0]) : c)));
    if (selectedCategory?.id === id && data && data[0]) {
      setSelectedCategory(mapCategoryFromDb(data[0]));
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setCategories(prev => prev.filter(c => c.id !== id));
    setMenuItems(prev => prev.filter(item => item.categoryId !== id));
    if (selectedCategory?.id === id) {
      setSelectedCategory(null);
    }
  };

  const selectCategory = (category: MenuCategory | null) => {
    setSelectedCategory(category);
  };

  // CRUD для пунктов меню
  const createMenuItem = async (itemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const dbData: any = {
      ...itemData,
      category_id: itemData.categoryId,
      is_visible: itemData.isVisible,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    delete dbData.categoryId;
    delete dbData.isVisible;
    const { data, error } = await supabase
      .from('menu_items')
      .insert([dbData])
      .select();
    if (error) throw error;
    setMenuItems(prev => [...prev, ...(data || []).map(mapItemFromDb)]);
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    const dbUpdates: any = { ...updates };
    if ('categoryId' in updates) {
      dbUpdates.category_id = updates.categoryId;
      delete dbUpdates.categoryId;
    }
    if ('isVisible' in updates) {
      dbUpdates.is_visible = updates.isVisible;
      delete dbUpdates.isVisible;
    }
    if ('createdAt' in updates) delete dbUpdates.createdAt;
    if ('updatedAt' in updates) dbUpdates.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('menu_items')
      .update(dbUpdates)
      .eq('id', id)
      .select();
    if (error) throw error;
    setMenuItems(prev => prev.map(item => (item.id === id ? mapItemFromDb(data[0]) : item)));
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  // CSV Import (оставим как есть, можно доработать позже)
  const importMenuFromCSV = async (restaurantId: string, csvContent: string): Promise<void> => {
    // Можно реализовать импорт через Supabase, если потребуется
    throw new Error('Импорт из CSV пока не реализован для Supabase');
  };

  // Utility functions (оставляем как есть)
  const getRestaurantCategories = (restaurantId: string) => {
    return categories
      .filter(category => category.restaurantId === restaurantId)
      .sort((a, b) => a.position - b.position);
  };

  const getCategoryItems = (categoryId: string) => {
    return menuItems
      .filter(item => item.categoryId === categoryId)
      .sort((a, b) => a.position - b.position);
  };

  const getPublicMenuUrl = (restaurantId: string) => {
    return `${window.location.origin}/menu/${restaurantId}`;
  };

  const getCurrencySymbol = (currency: string) => {
    return CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol || currency;
  };

  const formatPrice = (price: number, currency: string) => {
    const symbol = getCurrencySymbol(currency);
    if (currency === 'RUB') {
      return `${price.toFixed(0)} ${symbol}`;
    }
    return `${symbol}${price.toFixed(2)}`;
  };

  const formatWorkingHours = (workingHours: WorkingHours): string => {
    const openDays = Object.entries(workingHours)
      .filter(([_, hours]) => hours.isOpen);
    if (openDays.length === 0) return 'Закрыто';
    if (openDays.length === 7) {
      const allSameHours = Object.values(workingHours).every(hours => 
        hours.isOpen && 
        hours.openTime === workingHours.monday.openTime && 
        hours.closeTime === workingHours.monday.closeTime
      );
      if (allSameHours) {
        return `Ежедневно: ${workingHours.monday.openTime}-${workingHours.monday.closeTime}`;
      }
    }
    const dayStrings = openDays.slice(0, 3).map(([day, hours]) => 
      `${DAY_NAMES[day as keyof typeof DAY_NAMES]}: ${hours.openTime}-${hours.closeTime}`
    );
    return dayStrings.join(', ') + (openDays.length > 3 ? '...' : '');
  };

  const generateQRCode = async (restaurantId: string): Promise<string> => {
    try {
      const url = getPublicMenuUrl(restaurantId);
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  };

  const contextValue: AppContextType & { getDefaultFoodImage: typeof getDefaultFoodImage } = {
    restaurants,
    categories,
    menuItems,
    selectedRestaurant,
    selectedCategory,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    selectRestaurant,
    createCategory,
    updateCategory,
    deleteCategory,
    selectCategory,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    importMenuFromCSV,
    getRestaurantCategories,
    getCategoryItems,
    getPublicMenuUrl,
    getCurrencySymbol,
    formatPrice,
    formatWorkingHours,
    generateQRCode,
    getDefaultFoodImage
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};