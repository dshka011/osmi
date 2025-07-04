import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import QRCode from 'qrcode';
import { AppContextType, Restaurant, MenuCategory, MenuItem, CURRENCIES, DEFAULT_WORKING_HOURS, WorkingHours, DAY_NAMES } from '../types';
import supabase from '../supabaseClient';
import { useAuth } from './AuthContext';
import { fromDbRestaurant, toDbRestaurant, fromDbCategory, toDbCategory, fromDbMenuItem, toDbMenuItem } from '../utils/dbMapping';

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
          setRestaurants(demoRestaurantsWithFixedImages.map(fromDbRestaurant));
          allRestaurants = demoRestaurantsWithFixedImages;
        } else {
          const restaurantsWithFixedImages = (restaurantsData || []).map(restaurant => ({
            ...restaurant,
            logo: restaurant.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop',
            photo: restaurant.photo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
          }));
          setRestaurants(restaurantsWithFixedImages.map(fromDbRestaurant));
          allRestaurants = restaurantsWithFixedImages;
        }
        // Категории
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('*');
        if (categoriesError) throw categoriesError;
        setCategories((categoriesData || []).map(fromDbCategory));
        // Пункты меню
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('menu_items')
          .select('*');
        if (menuItemsError) throw menuItemsError;
        setMenuItems((menuItemsData || []).map(fromDbMenuItem));
        // По умолчанию выбираем первый ресторан
        if (allRestaurants.length > 0) {
          setSelectedRestaurant(fromDbRestaurant(allRestaurants[0]));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
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
    const dbData = toDbRestaurant({ ...restaurantData, userId: user.id });
    dbData.created_at = new Date().toISOString();
    dbData.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('restaurants')
      .insert([dbData])
      .select();
    if (error) throw error;
    setRestaurants(prev => [...prev, ...(data || []).map(fromDbRestaurant)]);
  };

  const updateRestaurant = async (id: string, updates: Partial<Restaurant>) => {
    const dbUpdates = toDbRestaurant(updates);
    const { data, error } = await supabase
      .from('restaurants')
      .update(dbUpdates)
      .eq('id', id)
      .select();
    if (error) throw error;
    setRestaurants(prev => prev.map(r => (r.id === id ? fromDbRestaurant(data[0]) : r)));
    if (selectedRestaurant?.id === id && data && data[0]) {
      setSelectedRestaurant(fromDbRestaurant(data[0]));
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
    const dbData = toDbCategory(categoryData);
    dbData.created_at = new Date().toISOString();
    dbData.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('menu_categories')
      .insert([dbData])
      .select();
    if (error) throw error;
    setCategories(prev => [...prev, ...(data || []).map(fromDbCategory)]);
  };

  const updateCategory = async (id: string, updates: Partial<MenuCategory>) => {
    const dbUpdates = toDbCategory(updates);
    if ('updatedAt' in updates) {
      dbUpdates.updated_at = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from('menu_categories')
      .update(dbUpdates)
      .eq('id', id)
      .select();
    if (error) throw error;
    setCategories(prev => prev.map(c => (c.id === id ? fromDbCategory(data[0]) : c)));
    if (selectedCategory?.id === id && data && data[0]) {
      setSelectedCategory(fromDbCategory(data[0]));
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
    const dbData = toDbMenuItem(itemData);
    dbData.created_at = new Date().toISOString();
    dbData.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from('menu_items')
      .insert([dbData])
      .select();
    if (error) throw error;
    setMenuItems(prev => [...prev, ...(data || []).map(fromDbMenuItem)]);
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    const dbUpdates = toDbMenuItem(updates);
    if ('updatedAt' in updates) {
      dbUpdates.updated_at = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from('menu_items')
      .update(dbUpdates)
      .eq('id', id)
      .select();
    if (error) throw error;
    setMenuItems(prev => prev.map(item => (item.id === id ? fromDbMenuItem(data[0]) : item)));
  };

  const deleteMenuItem = async (id: string) => {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  // CSV Import
  const importMenuFromCSV = async (restaurantId: string, csvContent: string): Promise<void> => {
    try {
      // Парсим CSV
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV файл должен содержать заголовок и хотя бы одну строку данных');
      }

      // Парсим заголовок
      const header = lines[0].split(',').map(col => col.trim().toLowerCase());
      const expectedColumns = ['category', 'name', 'description', 'price', 'tags'];
      
      // Проверяем наличие всех необходимых колонок
      for (const column of expectedColumns) {
        if (!header.includes(column)) {
          throw new Error(`Отсутствует обязательная колонка: ${column}`);
        }
      }

      // Получаем индексы колонок
      const categoryIndex = header.indexOf('category');
      const nameIndex = header.indexOf('name');
      const descriptionIndex = header.indexOf('description');
      const priceIndex = header.indexOf('price');
      const tagsIndex = header.indexOf('tags');

      // Создаем Map для отслеживания созданных категорий
      const categoryMap = new Map<string, string>();
      
      // Получаем существующие категории для этого ресторана
      const existingCategories = getRestaurantCategories(restaurantId);
      existingCategories.forEach(cat => {
        categoryMap.set(cat.name.trim().toLowerCase(), cat.id);
      });

      // Обрабатываем каждую строку данных
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Парсим строку с учетом кавычек
        const values = parseCSVLine(line);
        
        if (values.length < expectedColumns.length) {
          throw new Error(`Строка ${i + 1}: недостаточно данных`);
        }

        const categoryName = values[categoryIndex]?.trim();
        const itemName = values[nameIndex]?.trim();
        const description = values[descriptionIndex]?.trim();
        const priceStr = values[priceIndex]?.trim();
        const tagsStr = values[tagsIndex]?.trim();

        // Валидация данных
        if (!categoryName) {
          throw new Error(`Строка ${i + 1}: название категории обязательно`);
        }
        if (!itemName) {
          throw new Error(`Строка ${i + 1}: название блюда обязательно`);
        }
        if (!priceStr) {
          throw new Error(`Строка ${i + 1}: цена обязательна`);
        }

        const price = parseFloat(priceStr);
        if (isNaN(price) || price < 0) {
          throw new Error(`Строка ${i + 1}: некорректная цена`);
        }

        // Создаем категорию, если не существует
        let categoryId = categoryMap.get(categoryName.trim().toLowerCase());
        if (!categoryId) {
          await createCategory({
            name: categoryName,
            description: '',
            restaurantId,
            isVisible: true,
            position: existingCategories.length + categoryMap.size
          });
          // Получаем ID созданной категории из обновленного списка
          const updatedCategories = getRestaurantCategories(restaurantId);
          const newCategory = updatedCategories.find(cat => cat.name.trim().toLowerCase() === categoryName.trim().toLowerCase());
          if (newCategory) {
            categoryId = newCategory.id;
            categoryMap.set(categoryName.trim().toLowerCase(), categoryId);
          } else {
            throw new Error(`Не удалось создать категорию: ${categoryName}`);
          }
        }

        // Парсим теги
        const tags = tagsStr ? tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        // Создаем блюдо меню
        if (categoryId) {
          await createMenuItem({
          name: itemName,
            description: description || '',
          price,
            categoryId,
            tags,
            image: '',
          isVisible: true,
            position: getCategoryItems(categoryId).length
        });
        }
      }
    } catch (error) {
      throw error;
    }
  };

  // Вспомогательная функция для парсинга CSV строки с учетом кавычек
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Экранированная кавычка
          current += '"';
          i++; // Пропускаем следующую кавычку
        } else {
          // Начало или конец кавычек
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Конец поля
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // Добавляем последнее поле
    result.push(current);
    
    return result;
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

  const contextValue: AppContextType = {
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
    getDefaultFoodImage,
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};