import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { X, Trash2, Minus, Plus } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import OrderForm from './OrderForm';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
  restaurantId: string;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose, onCheckout, restaurantId }) => {
  const { items, updateQty, removeItem, clearCart } = useCart();
  const { t } = useLanguage();
  const [isConfirmClear, setIsConfirmClear] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className={`fixed inset-0 z-[9999] transition-all ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${open ? 'bg-opacity-40' : 'bg-opacity-0'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Ваш заказ</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {orderSuccess ? (
            <div className="text-center py-12">
              <div className="text-emerald-600 text-4xl mb-4">✓</div>
              <div className="text-lg font-semibold mb-2">Спасибо! Ваш заказ отправлен.</div>
              <div className="text-gray-500 mb-4">Ожидайте подтверждения от ресторана.</div>
              <button onClick={() => { setOrderSuccess(false); onClose(); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg">Закрыть</button>
            </div>
          ) : showOrderForm ? (
            <OrderForm
              restaurantId={restaurantId}
              onSuccess={() => setOrderSuccess(true)}
              onCancel={() => setShowOrderForm(false)}
            />
          ) : items.length === 0 ? (
            <div className="text-center text-gray-500 py-12">Корзина пуста</div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.menuItemId} className="flex items-center gap-3 border-b pb-3">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.price} x {item.qty} = <span className="font-semibold">{item.price * item.qty}</span></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.menuItemId, item.qty - 1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50" disabled={item.qty <= 1}><Minus className="w-4 h-4" /></button>
                    <span className="px-2">{item.qty}</span>
                    <button onClick={() => updateQty(item.menuItemId, item.qty + 1)} className="p-1 bg-gray-100 rounded hover:bg-gray-200"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => removeItem(item.menuItemId)} className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        {!showOrderForm && !orderSuccess && items.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Итого:</span>
              <span className="text-lg font-bold">{total}</span>
            </div>
            <button
              onClick={() => setShowOrderForm(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold text-lg transition-colors mb-2"
            >
              Оформить заказ
            </button>
            <button
              onClick={() => setIsConfirmClear(true)}
              className="w-full text-gray-500 hover:text-red-600 text-sm"
            >
              Очистить корзину
            </button>
          </div>
        )}
        {/* Confirm clear modal */}
        {isConfirmClear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl p-6 shadow-xl max-w-xs w-full">
              <h3 className="text-lg font-semibold mb-4">Очистить корзину?</h3>
              <div className="flex gap-2">
                <button onClick={() => { clearCart(); setIsConfirmClear(false); }} className="flex-1 bg-red-600 text-white py-2 rounded-lg">Да</button>
                <button onClick={() => setIsConfirmClear(false)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg">Нет</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer; 