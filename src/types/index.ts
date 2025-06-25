export interface Restaurant {
  id: string;
  name: string;
  description: string;
  logo?: string;
  photo?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  currency: string;
  workingHours: WorkingHours;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  position: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  tags: string[];
  isVisible: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  restaurants: Restaurant[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  selectedRestaurant: Restaurant | null;
  selectedCategory: MenuCategory | null;
}

export interface AppContextType extends AppState {
  // Restaurant actions
  createRestaurant: (restaurant: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRestaurant: (id: string, updates: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => void;
  selectRestaurant: (restaurant: Restaurant | null) => void;
  
  // Category actions
  createCategory: (category: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, updates: Partial<MenuCategory>) => void;
  deleteCategory: (id: string) => void;
  selectCategory: (category: MenuCategory | null) => void;
  
  // Menu item actions
  createMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  // CSV import
  importMenuFromCSV: (restaurantId: string, csvContent: string) => Promise<void>;
  
  // Utility functions
  getRestaurantCategories: (restaurantId: string) => MenuCategory[];
  getCategoryItems: (categoryId: string) => MenuItem[];
  getPublicMenuUrl: (restaurantId: string) => string;
  getCurrencySymbol: (currency: string) => string;
  formatPrice: (price: number, currency: string) => string;
  formatWorkingHours: (workingHours: WorkingHours) => string;
  generateQRCode: (restaurantId: string) => Promise<string>;
}

export const CURRENCIES = {
  RUB: { symbol: '₽', name: 'Russian Ruble' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  KRW: { symbol: '₩', name: 'South Korean Won' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' }
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
  saturday: { isOpen: true, openTime: '10:00', closeTime: '23:00' },
  sunday: { isOpen: true, openTime: '10:00', closeTime: '21:00' }
};

export const DAY_NAMES = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье'
} as const;