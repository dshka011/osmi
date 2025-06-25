import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'ru' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

const translations = {
  ru: {
    // Navigation
    'nav.restaurants': 'Рестораны',
    'nav.categories': 'Категории',
    'nav.menuItems': 'Блюда меню',
    'nav.preview': 'Превью меню',
    'nav.settings': 'Настройки',
    
    // Common
    'common.add': 'Добавить',
    'common.edit': 'Редактировать',
    'common.delete': 'Удалить',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.create': 'Создать',
    'common.update': 'Обновить',
    'common.close': 'Закрыть',
    'common.name': 'Название',
    'common.description': 'Описание',
    'common.price': 'Цена',
    'common.currency': 'Валюта',
    'common.phone': 'Телефон',
    'common.email': 'Email',
    'common.address': 'Адрес',
    'common.website': 'Веб-сайт',
    'common.photo': 'Фото',
    'common.logo': 'Логотип',
    'common.tags': 'Теги',
    'common.category': 'Категория',
    'common.visible': 'Видимый',
    'common.hidden': 'Скрытый',
    'common.open': 'Открыто',
    'common.closed': 'Закрыто',
    'common.daily': 'Ежедневно',
    'common.workingHours': 'Часы работы',
    'common.download': 'Скачать',
    'common.import': 'Импорт',
    'common.export': 'Экспорт',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.sort': 'Сортировка',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.success': 'Успешно',
    'common.warning': 'Предупреждение',
    'common.info': 'Информация',
    
    // Settings
    'settings.title': 'Настройки',
    'settings.subtitle': 'Настройте параметры приложения',
    'settings.language': 'Язык интерфейса',
    'settings.language.description': 'Выберите язык для отображения интерфейса',
    'settings.language.russian': 'Русский',
    'settings.language.english': 'English',
    'settings.appearance': 'Внешний вид',
    'settings.appearance.description': 'Настройки темы и отображения',
    'settings.notifications': 'Уведомления',
    'settings.notifications.description': 'Управление уведомлениями',
    'settings.data': 'Данные',
    'settings.data.description': 'Импорт и экспорт данных',
    'settings.about': 'О приложении',
    'settings.about.description': 'Информация о версии и разработчике',
    'settings.saved': 'Настройки сохранены',
    
    // Restaurant Manager
    'restaurant.title': 'Рестораны',
    'restaurant.subtitle': 'Управляйте ресторанами и создавайте ссылки на меню',
    'restaurant.add': 'Добавить ресторан',
    'restaurant.addFirst': 'Добавить первый ресторан',
    'restaurant.edit': 'Редактировать ресторан',
    'restaurant.create': 'Создать ресторан',
    'restaurant.update': 'Обновить ресторан',
    'restaurant.delete.confirm': 'Вы уверены, что хотите удалить "{name}"? Это также удалит все связанные категории и блюда меню.',
    'restaurant.name.placeholder': 'Введите название ресторана',
    'restaurant.description.placeholder': 'Краткое описание вашего ресторана',
    'restaurant.phone.placeholder': 'Номер телефона',
    'restaurant.email.placeholder': 'Email адрес',
    'restaurant.address.placeholder': 'Адрес ресторана',
    'restaurant.website.placeholder': 'https://yourrestaurant.com',
    'restaurant.logo.upload': 'Загрузить логотип ресторана',
    'restaurant.photo.upload': 'Загрузить фото ресторана',
    'restaurant.logo.choose': 'Выбрать логотип',
    'restaurant.photo.choose': 'Выбрать фото',
    'restaurant.currency.required': 'Валюта *',
    'restaurant.name.required': 'Название ресторана *',
    'restaurant.workingHours': 'Часы работы',
    'restaurant.copyLink': 'Копировать ссылку',
    'restaurant.qrCode': 'QR-код',
    'restaurant.linkCopied': 'Ссылка на меню скопирована в буфер обмена!',
    'restaurant.noRestaurants': 'Пока нет ресторанов',
    'restaurant.noRestaurants.description': 'Создайте свой первый ресторан, чтобы начать управление меню.',
    'restaurant.selectRestaurant': 'Выберите ресторан',
    'restaurant.selectRestaurant.description': 'Выберите активный ресторан',
    'restaurant.activeRestaurant': 'Активный ресторан',
    'restaurant.noDescription': 'Нет описания',
    'restaurant.csvImport': 'Импорт CSV',
    'restaurant.csvImport.title': 'Импорт меню из CSV',
    'restaurant.csvImport.description': 'Загрузите CSV файл с колонками: category, name, description, price, tags',
    'restaurant.csvImport.example': 'Пример: "Закуски,Брускетта,Хрустящий хлеб с томатами,450,вегетарианское"',
    'restaurant.csvImport.button': 'Импортировать меню',
    'restaurant.csvImport.success': 'Меню успешно импортировано!',
    'restaurant.csvImport.error': 'Ошибка импорта',
    'restaurant.csvImport.selectFile': 'Выберите корректный CSV файл',
    'restaurant.csvImport.importing': 'Импортируется...',
    
    // QR Code
    'qr.title': 'QR-код для {name}',
    'qr.description': 'Клиенты могут отсканировать этот QR-код для просмотра вашего меню',
    'qr.download': 'Скачать',
    'qr.error': 'Не удалось создать QR-код',
    
    // Categories
    'category.title': 'Категории меню',
    'category.subtitle': 'Организуйте ваше меню с категориями как Закуски, Основные блюда, Десерты',
    'category.add': 'Добавить категорию',
    'category.addFirst': 'Добавить первую категорию',
    'category.edit': 'Редактировать категорию',
    'category.create': 'Создать категорию',
    'category.update': 'Обновить категорию',
    'category.delete.confirm': 'Вы уверены, что хотите удалить "{name}"?',
    'category.delete.confirmWithItems': 'Вы уверены, что хотите удалить "{name}"? Это также удалит {count} блюд меню.',
    'category.name.placeholder': 'например, Закуски, Основные блюда, Десерты',
    'category.name.required': 'Название категории *',
    'category.description.placeholder': 'Необязательное описание для этой категории',
    'category.noCategories': 'Пока нет категорий',
    'category.noCategories.description': 'Создайте свою первую категорию для организации блюд меню.',
    'category.noRestaurant': 'Ресторан не выбран',
    'category.noRestaurant.description': 'Пожалуйста, сначала выберите ресторан для управления категориями.',
    'category.items': '{count} блюд',
    'category.items.single': '{count} блюдо',
    'category.hiddenFromMenu': 'Скрыто из меню',
    'category.showInMenu': 'Показать в меню',
    'category.hideFromMenu': 'Скрыть из меню',
    
    // Menu Items
    'menuItem.title': 'Блюда меню',
    'menuItem.subtitle': 'Добавляйте и управляйте вашими вкусными блюдами с фотографиями',
    'menuItem.add': 'Добавить блюдо',
    'menuItem.addToCategory': 'Добавить блюдо',
    'menuItem.edit': 'Редактировать блюдо',
    'menuItem.create': 'Создать блюдо',
    'menuItem.update': 'Обновить блюдо',
    'menuItem.delete.confirm': 'Вы уверены, что хотите удалить "{name}"?',
    'menuItem.name.placeholder': 'например, Пицца Маргарита',
    'menuItem.name.required': 'Название блюда *',
    'menuItem.description.placeholder': 'Опишите ваше вкусное блюдо...',
    'menuItem.price.placeholder': '500',
    'menuItem.price.required': 'Цена * ({currency})',
    'menuItem.tags.placeholder': 'вегетарианское, без глютена, острое (разделяйте запятыми)',
    'menuItem.photo.upload': 'Загрузить фото блюда',
    'menuItem.photo.choose': 'Выбрать фото',
    'menuItem.photo.description': 'Загрузите фото вашего блюда',
    'menuItem.category.required': 'Категория *',
    'menuItem.category.select': 'Выберите категорию',
    'menuItem.noItems': 'Нет блюд в этой категории.',
    'menuItem.addFirst': 'Добавить первое блюдо',
    'menuItem.noCategories': 'Категории не найдены',
    'menuItem.noCategories.description': 'Сначала создайте категории перед добавлением блюд меню.',
    'menuItem.noRestaurant': 'Ресторан не выбран',
    'menuItem.noRestaurant.description': 'Пожалуйста, сначала выберите ресторан для управления блюдами меню.',
    
    // Public Menu
    'publicMenu.noRestaurant': 'Ресторан не выбран',
    'publicMenu.noRestaurant.description': 'Пожалуйста, сначала выберите ресторан для превью меню.',
    'publicMenu.noMenu': 'Меню недоступно',
    'publicMenu.noMenu.description': 'Добавьте категории и блюда меню для просмотра публичного меню.',
    'publicMenu.poweredBy': 'Работает на',
    'publicMenu.platform': 'Osmi - Платформа цифрового меню',
    
    // Days of week
    'day.monday': 'Понедельник',
    'day.tuesday': 'Вторник',
    'day.wednesday': 'Среда',
    'day.thursday': 'Четверг',
    'day.friday': 'Пятница',
    'day.saturday': 'Суббота',
    'day.sunday': 'Воскресенье',
    
    // App
    'app.title': 'Osmi',
    'app.subtitle': 'Управление меню',
    'app.brand': 'Osmi Restaurant Menu Management Dashboard',
  },
  en: {
    // Navigation
    'nav.restaurants': 'Restaurants',
    'nav.categories': 'Categories',
    'nav.menuItems': 'Menu Items',
    'nav.preview': 'Preview Menu',
    'nav.settings': 'Settings',
    
    // Common
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.close': 'Close',
    'common.name': 'Name',
    'common.description': 'Description',
    'common.price': 'Price',
    'common.currency': 'Currency',
    'common.phone': 'Phone',
    'common.email': 'Email',
    'common.address': 'Address',
    'common.website': 'Website',
    'common.photo': 'Photo',
    'common.logo': 'Logo',
    'common.tags': 'Tags',
    'common.category': 'Category',
    'common.visible': 'Visible',
    'common.hidden': 'Hidden',
    'common.open': 'Open',
    'common.closed': 'Closed',
    'common.daily': 'Daily',
    'common.workingHours': 'Working Hours',
    'common.download': 'Download',
    'common.import': 'Import',
    'common.export': 'Export',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Configure application preferences',
    'settings.language': 'Interface Language',
    'settings.language.description': 'Choose the language for the interface display',
    'settings.language.russian': 'Русский',
    'settings.language.english': 'English',
    'settings.appearance': 'Appearance',
    'settings.appearance.description': 'Theme and display settings',
    'settings.notifications': 'Notifications',
    'settings.notifications.description': 'Manage notifications',
    'settings.data': 'Data',
    'settings.data.description': 'Import and export data',
    'settings.about': 'About',
    'settings.about.description': 'Version and developer information',
    'settings.saved': 'Settings saved',
    
    // Restaurant Manager
    'restaurant.title': 'Restaurants',
    'restaurant.subtitle': 'Manage your restaurants and generate menu links',
    'restaurant.add': 'Add Restaurant',
    'restaurant.addFirst': 'Add Your First Restaurant',
    'restaurant.edit': 'Edit Restaurant',
    'restaurant.create': 'Create Restaurant',
    'restaurant.update': 'Update Restaurant',
    'restaurant.delete.confirm': 'Are you sure you want to delete "{name}"? This will also delete all associated categories and menu items.',
    'restaurant.name.placeholder': 'Enter restaurant name',
    'restaurant.description.placeholder': 'Brief description of your restaurant',
    'restaurant.phone.placeholder': 'Phone number',
    'restaurant.email.placeholder': 'Email address',
    'restaurant.address.placeholder': 'Restaurant address',
    'restaurant.website.placeholder': 'https://yourrestaurant.com',
    'restaurant.logo.upload': 'Upload restaurant logo',
    'restaurant.photo.upload': 'Upload restaurant photo',
    'restaurant.logo.choose': 'Choose Logo',
    'restaurant.photo.choose': 'Choose Photo',
    'restaurant.currency.required': 'Currency *',
    'restaurant.name.required': 'Restaurant Name *',
    'restaurant.workingHours': 'Working Hours',
    'restaurant.copyLink': 'Copy Link',
    'restaurant.qrCode': 'QR Code',
    'restaurant.linkCopied': 'Menu link copied to clipboard!',
    'restaurant.noRestaurants': 'No restaurants yet',
    'restaurant.noRestaurants.description': 'Create your first restaurant to get started with menu management.',
    'restaurant.selectRestaurant': 'Select Restaurant',
    'restaurant.selectRestaurant.description': 'Choose active restaurant',
    'restaurant.activeRestaurant': 'Active Restaurant',
    'restaurant.noDescription': 'No description',
    'restaurant.csvImport': 'Import CSV',
    'restaurant.csvImport.title': 'Import Menu from CSV',
    'restaurant.csvImport.description': 'Upload a CSV file with columns: category, name, description, price, tags',
    'restaurant.csvImport.example': 'Example: "Starters,Bruschetta,Crispy bread with tomatoes,450,vegetarian"',
    'restaurant.csvImport.button': 'Import Menu',
    'restaurant.csvImport.success': 'Menu imported successfully!',
    'restaurant.csvImport.error': 'Import failed',
    'restaurant.csvImport.selectFile': 'Please select a valid CSV file',
    'restaurant.csvImport.importing': 'Importing...',
    
    // QR Code
    'qr.title': 'QR Code for {name}',
    'qr.description': 'Customers can scan this QR code to view your menu',
    'qr.download': 'Download',
    'qr.error': 'Failed to generate QR code',
    
    // Categories
    'category.title': 'Menu Categories',
    'category.subtitle': 'Organize your menu with categories like Starters, Mains, Desserts',
    'category.add': 'Add Category',
    'category.addFirst': 'Add Your First Category',
    'category.edit': 'Edit Category',
    'category.create': 'Create Category',
    'category.update': 'Update Category',
    'category.delete.confirm': 'Are you sure you want to delete "{name}"?',
    'category.delete.confirmWithItems': 'Are you sure you want to delete "{name}"? This will also delete {count} menu item(s).',
    'category.name.placeholder': 'e.g., Starters, Main Courses, Desserts',
    'category.name.required': 'Category Name *',
    'category.description.placeholder': 'Optional description for this category',
    'category.noCategories': 'No categories yet',
    'category.noCategories.description': 'Create your first category to organize your menu items.',
    'category.noRestaurant': 'No restaurant selected',
    'category.noRestaurant.description': 'Please select a restaurant first to manage categories.',
    'category.items': '{count} items',
    'category.items.single': '{count} item',
    'category.hiddenFromMenu': 'Hidden from menu',
    'category.showInMenu': 'Show in menu',
    'category.hideFromMenu': 'Hide from menu',
    
    // Menu Items
    'menuItem.title': 'Menu Items',
    'menuItem.subtitle': 'Add and manage your delicious menu items with photos',
    'menuItem.add': 'Add Menu Item',
    'menuItem.addToCategory': 'Add Item',
    'menuItem.edit': 'Edit Menu Item',
    'menuItem.create': 'Create Item',
    'menuItem.update': 'Update Item',
    'menuItem.delete.confirm': 'Are you sure you want to delete "{name}"?',
    'menuItem.name.placeholder': 'e.g., Margherita Pizza',
    'menuItem.name.required': 'Item Name *',
    'menuItem.description.placeholder': 'Describe your delicious dish...',
    'menuItem.price.placeholder': '0.00',
    'menuItem.price.required': 'Price * ({currency})',
    'menuItem.tags.placeholder': 'vegan, gluten-free, spicy (separate with commas)',
    'menuItem.photo.upload': 'Upload a photo of your dish',
    'menuItem.photo.choose': 'Choose Photo',
    'menuItem.photo.description': 'Upload a photo of your dish',
    'menuItem.category.required': 'Category *',
    'menuItem.category.select': 'Select a category',
    'menuItem.noItems': 'No items in this category yet.',
    'menuItem.addFirst': 'Add your first item',
    'menuItem.noCategories': 'No categories found',
    'menuItem.noCategories.description': 'Create some categories first before adding menu items.',
    'menuItem.noRestaurant': 'No restaurant selected',
    'menuItem.noRestaurant.description': 'Please select a restaurant first to manage menu items.',
    
    // Public Menu
    'publicMenu.noRestaurant': 'No restaurant selected',
    'publicMenu.noRestaurant.description': 'Please select a restaurant first to preview the menu.',
    'publicMenu.noMenu': 'No menu available',
    'publicMenu.noMenu.description': 'Add some categories and menu items to see the public menu preview.',
    'publicMenu.poweredBy': 'Powered by',
    'publicMenu.platform': 'Osmi - Digital Menu Platform',
    
    // Days of week
    'day.monday': 'Monday',
    'day.tuesday': 'Tuesday',
    'day.wednesday': 'Wednesday',
    'day.thursday': 'Thursday',
    'day.friday': 'Friday',
    'day.saturday': 'Saturday',
    'day.sunday': 'Sunday',
    
    // App
    'app.title': 'Osmi',
    'app.subtitle': 'Menu Management',
    'app.brand': 'Osmi Restaurant Menu Management Dashboard',
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('osmi-language');
    return (saved as Language) || 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('osmi-language', lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};