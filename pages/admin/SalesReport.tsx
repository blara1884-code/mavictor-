import React, { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../../contexts/ProductContext';
import type { Order } from '../../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import socket from '../../src/socket';

declare module 'jspdf' {
  interface jsPDF {
    autoTable(options: any): this;
    lastAutoTable?: { finalY: number };
  }
}

const SalesReport: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { products, loading: productsLoading } = useProducts();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/orders");
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
            } catch (e) {
                console.error("Erro ao carregar pedidos", e);
            } finally {
                setLoading(false);
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

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const orderDate = new Date(order.created_at);

            if (startDate) {
                const [y, m, d] = startDate.split('-').map(Number);
                const filterStartDate = new Date(y, m - 1, d);
                filterStartDate.setHours(0, 0, 0, 0);
                if (orderDate < filterStartDate) return false;
            }

            if (endDate) {
                const [y, m, d] = endDate.split('-').map(Number);
                const filterEndDate = new Date(y, m - 1, d);
                filterEndDate.setHours(23, 59, 59, 999);
                if (orderDate > filterEndDate) return false;
            }

            return true;
        });
    }, [orders, startDate, endDate]);

    const totalSales = useMemo(() => {
        return filteredOrders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);
    }, [filteredOrders]);

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    const generateSalesPdf = () => {
        const doc = new jsPDF();
        doc.text("Relatório de Vendas", 14, 20);
        if(startDate || endDate) {
            doc.setFontSize(10);
            doc.text(`Período: ${startDate || 'N/A'} a ${endDate || 'N/A'}`, 14, 26);
        }

        const tableColumn = ["ID Pedido", "Data", "Cliente", "Status", "Itens", "Total"];
        const tableRows: (string | number)[][] = [];

        filteredOrders.forEach(order => {
            const orderData = [
                order.id,
                new Date(order.created_at).toLocaleDateString(),
                order.user_email,
                order.status.toUpperCase(),
                order.items.map(item => `${item.quantity}x ${item.name}`).join('\n'),
                `R$ ${Number(order.total_price).toFixed(2)}`
            ];
            tableRows.push(orderData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 32,
            styles: { halign: 'left', fontSize: 8 },
            columnStyles: { 4: { cellWidth: 'auto' } }
        });
        
        const finalY = doc.lastAutoTable?.finalY || 30;
        doc.setFontSize(12);
        doc.text(`Total de Vendas no Período: R$ ${totalSales.toFixed(2)}`, 14, finalY + 15);

        doc.save(`relatorio_vendas_${new Date().toISOString().slice(0,10)}.pdf`);
    };
    
    const generateStockPdf = () => {
        const doc = new jsPDF();
        doc.text("Relatório de Estoque", 14, 20);

        const tableColumn = ["ID", "Produto", "Categoria", "Preço", "Estoque"];
        const tableRows: (string | number)[][] = [];

        products.forEach(product => {
            const productData = [
                product.id,
                product.name,
                product.category_id, // Exibindo o ID da categoria por enquanto
                `R$ ${product.price.toFixed(2)}`,
                product.stock_quantity
            ];
            tableRows.push(productData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
        });

        doc.save(`relatorio_estoque_${new Date().toISOString().slice(0,10)}.pdf`);
    };

    if (loading || productsLoading) {
        return <p>Carregando relatórios...</p>;
    }

    return (
        <div className="space-y-12">
            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Relatório de Vendas</h1>
                    <button
                        onClick={generateSalesPdf}
                        disabled={filteredOrders.length === 0}
                        className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition disabled:bg-primary-300 disabled:cursor-not-allowed"
                    >
                        Gerar PDF
                    </button>
                </div>

                <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-50 rounded-md">
                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Data de Início</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md"/>
                    </div>
                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">Data Final</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md"/>
                    </div>
                    <button onClick={handleClearFilters} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition">Limpar Filtros</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-y-gray-200">
                         <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Pedido</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user_email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase font-bold text-[10px] tracking-widest">
                                      {order.status || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{order.items?.map(item => `${item.name} (x${item.quantity})`).join(', ')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-700">R${Number(order.total_price).toFixed(2)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500">Nenhum pedido encontrado para o período selecionado.</td>
                                </tr>
                            )}
                        </tbody>
                         <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan={4} className="px-6 py-3 text-right text-sm font-bold text-gray-600 uppercase">Total do Período</td>
                                <td className="px-6 py-3 text-right text-base font-bold text-gray-800">R${totalSales.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="bg-white p-4 sm:p-8 rounded-lg shadow-md">
                 <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Relatório de Estoque</h2>
                     <button
                        onClick={generateStockPdf}
                        disabled={products.length === 0}
                        className="bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition disabled:bg-primary-300"
                    >
                        Gerar PDF de Estoque
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Categoria</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category_id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">{product.stock_quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesReport;