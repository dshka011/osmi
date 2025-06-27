import React, { useEffect, useState } from 'react';
import supabase from '../../supabaseClient';

interface DashboardStatsProps {
  restaurantId: string;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  status: string;
  created_at: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ restaurantId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setOrders(data || []);
        setLoading(false);
      });
  }, [restaurantId]);

  // Считаем метрики
  const paidOrders = orders.filter(o => o.status !== 'cancelled' && Array.isArray(o.items) && o.items.every(i => typeof i.price === 'number' && typeof i.qty === 'number'));
  const totalRevenue = paidOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.qty, 0),
    0
  );
  const orderCount = paidOrders.length;
  const avgCheck = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  // Топ-5 блюд
  const itemStats: Record<string, { name: string; qty: number }> = {};
  paidOrders.forEach(order => {
    order.items.forEach(item => {
      if (!itemStats[item.menuItemId]) {
        itemStats[item.menuItemId] = { name: item.name, qty: 0 };
      }
      itemStats[item.menuItemId].qty += item.qty;
    });
  });
  const topItems = Object.values(itemStats)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  if (loading) return <div className="p-6 text-gray-500">Загрузка метрик...</div>;
  if (error) return <div className="p-6 text-red-500">Ошибка: {error}</div>;
  if (orderCount === 0) return <div className="p-6 text-gray-400">Нет данных для метрик</div>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <div className="text-2xl font-bold">{totalRevenue} ₽</div>
        <div className="text-gray-500 mt-1">Общая выручка</div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <div className="text-2xl font-bold">{orderCount}</div>
        <div className="text-gray-500 mt-1">Количество заказов</div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
        <div className="text-2xl font-bold">{avgCheck} ₽</div>
        <div className="text-gray-500 mt-1">Средний чек</div>
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <div className="font-bold mb-2">Топ-5 блюд</div>
        <ol className="list-decimal ml-4 text-gray-700">
          {topItems.length === 0 && <li>Нет данных</li>}
          {topItems.map((item, idx) => (
            <li key={idx}>{item.name} <span className="text-gray-400">×{item.qty}</span></li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default DashboardStats; 