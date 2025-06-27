import React, { useEffect, useState, useRef, useCallback } from 'react';
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

// Модалка для деталей заказа
const OrderModal: React.FC<{ order: any; onClose: () => void; onStatusChange: (id: string, status: string) => void; onDelete: (id: string) => void }> = ({ order, onClose, onStatusChange, onDelete }) => {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">×</button>
        <h2 className="text-xl font-bold mb-2">Заказ #{order.id.slice(-5)}</h2>
        <div className="mb-2 text-gray-600">{new Date(order.created_at).toLocaleString()}</div>
        <div className="mb-2 font-medium">Позиции:</div>
        <ul className="list-disc ml-6 mb-2">
          {order.items.map((item: any, idx: number) => (
            <li key={idx}>{item.name} x{item.qty} — {item.price * item.qty} ₽</li>
          ))}
        </ul>
        <div className="font-semibold mb-2">Сумма заказа: {order.items.reduce((sum: number, i: any) => sum + i.price * i.qty, 0)} ₽</div>
        <div className="text-sm text-gray-600 mb-1">Имя: <span className="font-semibold">{order.guest_name || '-'}</span></div>
        <div className="text-sm text-gray-600 mb-1">Стол: <span className="font-semibold">{order.table_number || '-'}</span></div>
        {order.comment && <div className="text-sm text-gray-600 mb-1">Комментарий: <span className="font-semibold">{order.comment}</span></div>}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button onClick={() => onStatusChange(order.id, 'in_progress')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold">В работе</button>
          <button onClick={() => onStatusChange(order.id, 'done')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold">Выполнен</button>
          <button onClick={() => onStatusChange(order.id, 'cancelled')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">Отменить</button>
          <button onClick={() => { if(window.confirm('Удалить этот заказ?')) onDelete(order.id); }} className="bg-gray-200 hover:bg-red-600 hover:text-white text-gray-700 px-4 py-2 rounded-lg font-semibold ml-auto">Удалить</button>
        </div>
      </div>
    </div>
  );
};

const STATUS_COLUMNS = [
  { id: 'new', label: 'Новые', color: 'emerald-500' },
  { id: 'in_progress', label: 'В работе', color: 'yellow-500' },
  { id: 'done', label: 'Выполнен', color: 'gray-400' },
  { id: 'cancelled', label: 'Отменён', color: 'red-500' },
];

const KanbanOrders: React.FC<{ orders: any[]; onStatusChange: (id: string, status: string) => void; onDelete: (id: string) => void }> = ({ orders, onStatusChange, onDelete }) => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  // Группируем заказы по статусу
  const grouped = STATUS_COLUMNS.map(col => ({
    ...col,
    orders: orders.filter(o => o.status === col.id)
  }));
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {grouped.map(col => (
        <div key={col.id} className="flex-1 min-w-[260px] bg-gray-50 rounded-xl p-2 border border-gray-200">
          <div className={`font-bold mb-2 text-${col.color}`}>{col.label}</div>
          <div className="space-y-2">
            {col.orders.length === 0 && <div className="text-gray-300 text-sm italic">Нет заказов</div>}
            {col.orders.map(order => (
              <div
                key={order.id}
                className={`bg-white rounded-lg shadow p-3 cursor-pointer hover:bg-gray-100 transition ${order.status === 'new' ? 'animate-pulse bg-emerald-100' : ''} ${order.status === 'done' ? 'bg-emerald-50' : ''} relative`}
                onClick={() => setSelectedOrder(order)}
              >
                {/* Цветная полоса слева */}
                <div className={`absolute left-0 top-0 h-full w-2 rounded-l-lg bg-${col.color}`}></div>
                <div className="ml-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">#{order.id.slice(-5)}</span>
                    <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">Стол: <span className="font-semibold">{order.table_number || '-'}</span></div>
                  <div className="text-sm font-bold">{order.items.reduce((sum: number, i: any) => sum + i.price * i.qty, 0)} ₽</div>
                  {order.status === 'done' && (
                    <span className="mt-2 inline-block px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">Выполнен</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={(id, status) => { onStatusChange(id, status); setSelectedOrder(null); }} onDelete={onDelete} />}
    </div>
  );
};

const OrdersManager: React.FC = () => {
  const { selectedRestaurant } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
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

  const deleteOrder = useCallback(async (orderId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот заказ?')) return;
    await supabase.from('orders').delete().eq('id', orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
  }, []);

  return (
    <div className="p-6">
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/07/26/audio_124bfae1b2.mp3" preload="auto" />
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-4">
        Заказы
        <button
          className={`px-3 py-1 rounded-lg text-sm font-semibold border ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600'} transition`}
          onClick={() => setViewMode('list')}
        >
          Список
        </button>
        <button
          className={`px-3 py-1 rounded-lg text-sm font-semibold border ${viewMode === 'kanban' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600'} transition`}
          onClick={() => setViewMode('kanban')}
        >
          Доска
        </button>
      </h1>
      {selectedRestaurant && <DashboardStats restaurantId={selectedRestaurant.id} />}
      {loading ? (
        <div className="text-center text-gray-500">Загрузка...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Нет заказов</div>
      ) : viewMode === 'list' ? (
        <div className="space-y-6">
          {orders.map(order => {
            let statusColor = '';
            let statusBg = '';
            switch (order.status) {
              case 'new':
                statusColor = 'emerald-500';
                statusBg = 'bg-emerald-50';
                break;
              case 'in_progress':
                statusColor = 'yellow-500';
                statusBg = 'bg-yellow-50';
                break;
              case 'done':
                statusColor = 'gray-400';
                statusBg = 'bg-gray-50';
                break;
              case 'cancelled':
                statusColor = 'red-500';
                statusBg = 'bg-red-50';
                break;
              default:
                statusColor = 'gray-300';
                statusBg = 'bg-white';
            }
            return (
              <div key={order.id} className={`relative flex rounded-xl bg-white shadow p-4 ${statusBg} ${order.status === 'new' ? 'animate-pulse bg-emerald-100' : ''}`}>
                {/* Цветная полоса слева */}
                <div className={`absolute left-0 top-0 h-full w-2 rounded-l-xl bg-${statusColor}`}></div>
                <div className="flex-1 ml-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">Заказ #{order.id.slice(-5)}</span>
                    <span className={`px-4 py-2 rounded-full text-base font-bold ${order.status === 'done' ? 'bg-emerald-500 text-white' : `bg-${statusColor} text-white`} shadow`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{new Date(order.created_at).toLocaleString()}</div>
                  <div className="mb-2">
                    <div className="font-medium">Позиции:</div>
                    <ul className="list-disc ml-6">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.name} x{item.qty} — {item.price * item.qty} ₽
                        </li>
                      ))}
                    </ul>
                    <div className="font-semibold mt-2">Сумма заказа: {order.items.reduce((sum, i) => sum + i.price * i.qty, 0)} ₽</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">Имя: <span className="font-semibold">{order.guest_name || '-'}</span></div>
                  <div className="text-sm text-gray-600 mb-1">Стол: <span className="font-semibold">{order.table_number || '-'}</span></div>
                  {order.comment && <div className="text-sm text-gray-600 mb-1">Комментарий: <span className="font-semibold">{order.comment}</span></div>}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button onClick={() => updateStatus(order.id, 'in_progress')} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold">В работе</button>
                    <button onClick={() => updateStatus(order.id, 'done')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold">Выполнен</button>
                    <button onClick={() => updateStatus(order.id, 'cancelled')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">Отменить</button>
                    <button onClick={() => deleteOrder(order.id)} className="bg-gray-200 hover:bg-red-600 hover:text-white text-gray-700 px-4 py-2 rounded-lg font-semibold ml-auto">Удалить</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <KanbanOrders orders={orders} onStatusChange={updateStatus} onDelete={deleteOrder} />
      )}
    </div>
  );
};

export default OrdersManager; 