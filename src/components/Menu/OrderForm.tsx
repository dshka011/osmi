import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import supabase from '../../supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { OrderPayload } from '../../types';

interface OrderFormProps {
  restaurantId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ restaurantId, onSuccess, onCancel }) => {
  const { items, clearCart } = useCart();
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotifications();
  const [guestName, setGuestName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    try {
      const payload: OrderPayload = {
        restaurantId,
        items,
        guestName: guestName.trim() || undefined,
        tableNumber: tableNumber.trim() || undefined,
        comment: comment.trim() || undefined,
      };
      const { error } = await supabase.from('orders').insert({
        restaurant_id: payload.restaurantId,
        items: payload.items,
        guest_name: payload.guestName,
        table_number: payload.tableNumber,
        comment: payload.comment,
        status: 'new',
      });
      if (error) throw error;
      showSuccess('Заказ отправлен', 'Ваш заказ успешно оформлен!');
      clearCart();
      onSuccess();
    } catch (err: any) {
      showError('Ошибка заказа', err.message || 'Не удалось оформить заказ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Имя (необязательно)</label>
        <input
          type="text"
          value={guestName}
          onChange={e => setGuestName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Ваше имя"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Стол (необязательно)</label>
        <input
          type="text"
          value={tableNumber}
          onChange={e => setTableNumber(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="Например, 5 или A2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий к заказу</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows={2}
          placeholder="Особые пожелания, аллергии и т.д."
        />
      </div>
      <button
        type="submit"
        disabled={loading || items.length === 0}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
      >
        {loading ? 'Отправка...' : 'Отправить заказ'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="w-full mt-2 text-gray-500 hover:text-red-600 text-sm"
      >
        Отмена
      </button>
    </form>
  );
};

export default OrderForm; 