import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../../supabaseClient';
import { Restaurant, MenuCategory, MenuItem, DAY_NAMES } from '../../types';
import { MapPin, Phone, Mail, Globe, Clock, Tag } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PublicMenuProps {
  restaurantId?: string;
}

const PublicMenu: React.FC<PublicMenuProps> = ({ restaurantId: propRestaurantId }) => {
  const { restaurantId: urlRestaurantId } = useParams<{ restaurantId: string }>();
  const restaurantId = propRestaurantId || urlRestaurantId;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Получаем ресторан
        const { data: restData, error: restError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
        if (restError || !restData) throw new Error('Ресторан не найден');
        setRestaurant({
          ...restData,
          workingHours: restData.working_hours,
          createdAt: new Date(restData.created_at),
          updatedAt: new Date(restData.updated_at),
        });
        // Получаем категории
        const { data: catData, error: catError } = await supabase
          .from('menu_categories')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('position', { ascending: true });
        if (catError) throw catError;
        setCategories(catData || []);
        // Получаем блюда
        const { data: itemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select('*')
          .in('category_id', (catData || []).map((c: any) => c.id))
          .order('position', { ascending: true });
        if (itemsError) throw itemsError;
        setMenuItems(itemsData || []);
      } catch (e: any) {
        setError(e.message || 'Ошибка загрузки меню');
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) fetchData();
  }, [restaurantId]);

  const getCategoryItems = (categoryId: string) =>
    menuItems.filter((item) => {
      // @ts-ignore
      return (item.categoryId ?? item['category_id']) === categoryId;
    });

  // Локальная функция для форматирования цены
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'RUB') return `${price.toFixed(0)} ₽`;
    if (currency === 'USD') return `$${price.toFixed(2)}`;
    if (currency === 'EUR') return `€${price.toFixed(2)}`;
    return `${price} ${currency}`;
  };

  // --- Вспомогательные для расписания ---
  const getTodayKey = () => {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    return days[new Date().getDay()];
  };
  const todayKey = getTodayKey();
  const today = restaurant?.workingHours ? (restaurant.workingHours as any)[todayKey] as import('../../types').DayHours : undefined;
  const fullSchedule = restaurant?.workingHours ? (Object.entries(restaurant.workingHours) as [keyof typeof DAY_NAMES, import('../../types').DayHours][]) : [];

  // --- Заглушка для фото блюда ---
  const getDefaultFoodImage = (dishName: string) =>
    `https://source.unsplash.com/400x300/?food,${encodeURIComponent(dishName)}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка меню...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold mb-2">{error}</p>
          <p className="text-gray-500">Проверьте ссылку или попробуйте позже.</p>
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  const currency = restaurant.currency || 'RUB';
  
  if (categories.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('publicMenu.noMenu')}</h3>
          <p className="text-gray-500">{t('publicMenu.noMenu.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 px-2 md:px-0">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
          {restaurant.photo && (
            <img
              src={restaurant.photo}
              alt={restaurant.name}
              className="w-full md:w-56 h-40 object-cover rounded-xl border border-gray-200"
            />
          )}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
            <p className="text-gray-600 mb-2">{restaurant.description}</p>
            {restaurant.address && (
              <p className="text-gray-500 text-sm mb-1 flex items-center justify-center md:justify-start"><MapPin className="w-4 h-4 mr-1" />{restaurant.address}</p>
            )}
            {restaurant.phone && (
              <p className="text-gray-500 text-sm flex items-center justify-center md:justify-start"><Phone className="w-4 h-4 mr-1" />{restaurant.phone}</p>
            )}
            {/* Часы работы */}
            {today && (
              <div className="mt-2 flex items-center justify-center md:justify-start">
                <Clock className="w-4 h-4 mr-1 text-emerald-600" />
                <span className="text-sm text-gray-700">
                  {today.isOpen
                    ? `Сегодня: ${today.openTime}–${today.closeTime}`
                    : 'Сегодня выходной'}
                </span>
                <button
                  className="ml-2 text-xs text-blue-600 underline hover:no-underline"
                  onClick={() => setShowFullSchedule((v) => !v)}
                >
                  {showFullSchedule ? 'Скрыть' : 'Показать все'}
                </button>
              </div>
            )}
            {showFullSchedule && (
              <div className="mt-2 bg-gray-50 rounded-lg p-2 text-xs text-gray-700 border border-gray-100">
                {fullSchedule.map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span>{DAY_NAMES[day as keyof typeof DAY_NAMES]}</span>
                    <span>{hours.isOpen ? `${hours.openTime}–${hours.closeTime}` : 'Выходной'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto">
        {categories.map((cat) => (
          <div key={cat.id} className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-700 mb-4 border-b border-emerald-100 pb-1">{cat.name}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {getCategoryItems(cat.id).map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col">
                  <img
                    src={item.image && item.image.trim() ? item.image : getDefaultFoodImage(item.name)}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-lg mb-2 border border-gray-200"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-emerald-700 font-semibold text-lg">{formatPrice(item.price, currency)}</span>
                    {item.tags && item.tags.length > 0 && (
                      <span className="text-xs text-gray-400 bg-gray-100 rounded px-2 py-1 ml-2">{item.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
              ))}
              {getCategoryItems(cat.id).length === 0 && (
                <div className="text-gray-400 italic">Нет блюд в этой категории</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicMenu;