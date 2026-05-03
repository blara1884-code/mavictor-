
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import type { Order, Product } from '../../types';
import TrashIcon from '../../components/icons/TrashIcon';
import { useState, useEffect } from 'react';
import socket from '../../src/socket';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center">
    <div className="bg-slate-50 text-slate-900 rounded-xl p-3 mr-4">
        {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const ProductList: React.FC = () => {
    const { products, loading, error, deleteProduct, fetchProducts } = useProducts();
    const navigate = useNavigate();

    if (loading) return <p>Carregando produtos...</p>;
    if (error) return <p className="text-red-500">Erro ao carregar produtos: {error}</p>;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mt-8 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                 <h2 className="text-lg font-bold text-slate-900">Inventário de Produtos</h2>
                 <button 
                    onClick={() => fetchProducts()}
                    className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                 >
                    Atualizar
                 </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produto</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoria</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preço</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estoque</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-50">
                        {products.map(product => (
                            <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{product.category_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">R${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${product.stock_quantity < 10 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                    {product.stock_quantity} un
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="text-slate-400 hover:text-slate-900 mr-4 transition-colors">Editar</button>
                                    <button onClick={() => deleteProduct(product.id)} className="text-slate-400 hover:text-red-600 transition-colors"><TrashIcon className="w-5 h-5 inline-block"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
  const { products } = useProducts();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const response = await fetch("/api/orders");
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (e) {
            console.error("Erro ao carregar pedidos", e);
        }
    };
    fetchOrders();

    socket.on("orders_updated", (updatedOrders: Order[]) => {
        setOrders(updatedOrders);
    });

    return () => {
        socket.off("orders_updated");
    };
  }, []);

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Falha ao atualizar status');
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status do pedido');
    }
  };

  const todayOrders = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return orders.filter(o => new Date(o.created_at).toLocaleDateString() === today);
  }, [orders]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock_quantity, 0);
    const totalSoldValue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
    const productsSoldCount = orders.reduce((sum, o) => sum + (o.items?.reduce((itemSum, i) => itemSum + i.quantity, 0) || 0), 0);
    const todayValue = todayOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
    return { totalProducts, totalStock, totalSoldValue, productsSoldCount, todayValue };
  }, [products, orders, todayOrders]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 font-light mt-1">Visão geral do desempenho da sua loja.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Produtos Ativos" value={stats.totalProducts} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
        <StatCard title="Vendas Hoje" value={`R$${stats.todayValue.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
        <StatCard title="Itens Vendidos" value={stats.productsSoldCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
        <StatCard title="Receita Total" value={`R$${stats.totalSoldValue.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
      </div>

      {/* Vendas de Hoje */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Vendas do Dia (Hoje)</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                    <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horário</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pagamento</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Itens</th>
                        <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                    {todayOrders.length > 0 ? todayOrders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{order.user_email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {order.payment_method || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <select 
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border-none cursor-pointer focus:ring-0 ${
                                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                        order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                        'bg-amber-50 text-amber-600'
                                    }`}
                                >
                                    <option value="pending">📱 No WhatsApp</option>
                                    <option value="completed">✅ Concluído</option>
                                    <option value="cancelled">❌ Cancelado</option>
                                </select>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                {order.items?.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                                R${Number(order.total_price).toFixed(2)}
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400 italic">
                                Nenhuma venda registrada hoje ainda.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      <ProductList />
    </div>
  );
};

export default AdminDashboard;
