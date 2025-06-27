import React, { useEffect, useState, useRef } from 'react';
import supabase from '../../supabaseClient';
import { useAppContext } from '../../contexts/AppContext';
import { MenuCategory, MenuItem } from '../../types';
import DashboardStats from './DashboardStats';

interface Order {
  id: string;
  restaurant_id: string;
  items: any[];
  guest_name?: string;
  table_number?: string;
  comment?: string;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  done: 'Выполнен',
  cancelled: 'Отменён',
};

const OrdersManager: React.FC = () => {
  const { selectedRestaurant } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!selectedRestaurant) return;
    setLoading(true);
    // 1. Получаем все заказы
    supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', selectedRestaurant.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setLoading(false);
      });
    // 2. Подписка на новые заказы
    const subscription = supabase
      .channel('orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${selectedRestaurant.id}` },
        payload => {
          setOrders(prev => [payload.new as Order, ...prev]);
          // Воспроизвести звук
          if (audioRef.current) audioRef.current.play();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedRestaurant]);

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  return (
    <div className="p-6">
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae1b2.mp3" preload="auto" />
      <h1 className="text-2xl font-bold mb-6">Заказы</h1>
      {selectedRestaurant && <DashboardStats restaurantId={selectedRestaurant.id} />}
      {loading ? (
        <div className="text-center text-gray-500">Загрузка...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Нет заказов</div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className={`rounded-xl border-2 p-4 shadow-sm ${order.status === 'new' ? 'border-emerald-500 bg-emerald-50 animate-pulse' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg">Заказ #{order.id.slice(-5)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'new' ? 'bg-emerald-500 text-white' : order.status === 'done' ? 'bg-gray-200 text-gray-600' : order.status === 'in_progress' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-700'}`}>{STATUS_LABELS[order.status] || order.status}</span>
              </div>
              <div className="text-sm text-gray-700 mb-2">{new Date(order.created_at).toLocaleString()}</div>
              <div className="mb-2">
                <div className="font-medium">Позиции:</div>
                <ul className="list-disc ml-6">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} x{item.qty} — {item.price} ₽
                      <span className="text-gray-400"> (итого: {item.price * item.qty} ₽)</span>
                    </li>
                  ))}
                </ul>
                <div className="font-semibold mt-2">Сумма заказа: {order.items.reduce((sum, i) => sum + i.price * i.qty, 0)} ₽</div>
              </div>
              <div className="text-sm text-gray-600 mb-1">Имя: <span className="font-semibold">{order.guest_name || '-'}</span></div>
              <div className="text-sm text-gray-600 mb-1">Стол: <span className="font-semibold">{order.table_number || '-'}</span></div>
              {order.comment && <div className="text-sm text-gray-600 mb-1">Комментарий: <span className="font-semibold">{order.comment}</span></div>}
              <div className="flex gap-2 mt-3">
                {order.status !== 'done' && order.status !== 'cancelled' && (
                  <button onClick={() => updateStatus(order.id, 'in_progress')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold">В работе</button>
                )}
                {order.status !== 'done' && (
                  <button onClick={() => updateStatus(order.id, 'done')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold">Выполнен</button>
                )}
                {order.status !== 'cancelled' && (
                  <button onClick={() => updateStatus(order.id, 'cancelled')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">Отменить</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersManager; 