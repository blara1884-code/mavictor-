import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Order } from '../../types';
import socket from '../../src/socket';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const allOrders = await response.json();
        setOrders(allOrders.filter((o: any) => o.user_id === user.id));
      }
    } catch (e) {
      console.error("Erro ao carregar pedidos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    socket.on("orders_updated", (updatedOrders: Order[]) => {
      if (user) {
        setOrders(updatedOrders.filter((o: any) => o.user_id === user.id));
      }
    });

    return () => {
      socket.off("orders_updated");
    };
  }, [user]);

  if (loading) return <div className="p-8 text-center">Carregando seus pedidos...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meus Pedidos</h1>
      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
          <p className="text-gray-500">Você ainda não realizou nenhum pedido.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pedido #{order.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                    order.status === 'Pago' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{new Date(order.order_date).toLocaleDateString()} às {new Date(order.order_date).toLocaleTimeString()}</p>
                <div className="mt-2">
                  {order.order_items.map((item, idx) => (
                    <span key={idx} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded mr-2">
                      {item.products.name} (x{item.quantity})
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">R$ {order.total_amount.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold">{order.payment_method}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
