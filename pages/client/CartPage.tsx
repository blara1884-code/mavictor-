
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import TrashIcon from '../../components/icons/TrashIcon';

const CartPage: React.FC = () => {
    const { cart, removeFromCart, updateQuantity, totalPrice, itemCount } = useCart();
    const navigate = useNavigate();

    if (itemCount === 0) {
        return (
            <div className="text-center bg-white p-10 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4">Seu Carrinho está Vazio</h1>
                <p className="text-gray-600 mb-6">Parece que você ainda não adicionou nada ao seu carrinho.</p>
                <Link to="/" className="bg-primary-500 text-white py-2 px-6 rounded-md hover:bg-primary-600 transition">
                    Começar a Comprar
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Seu Carrinho de Compras</h1>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    {cart.map(item => (
                        <div key={item.product.id + item.size} className="flex items-center border-b py-4 last:border-b-0">
                            <img src={item.product.image_url} alt={item.product.name} className="w-24 h-24 object-cover rounded-md" />
                            <div className="flex-grow ml-4">
                                <h2 className="text-lg font-semibold">{item.product.name}</h2>
                                <p className="text-gray-500 text-sm">Tamanho: {item.size}</p>
                                <p className="text-gray-600 mt-1">R${item.product.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.product.id, item.size, parseInt(e.target.value))}
                                    min="1"
                                    max={item.product.stock_quantity}
                                    className="w-16 border rounded-md text-center"
                                />
                                <button onClick={() => removeFromCart(item.product.id, item.size)} className="text-gray-500 hover:text-primary-600">
                                    <TrashIcon className="w-6 h-6"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-2xl font-semibold border-b pb-4 mb-4">Resumo do Pedido</h2>
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal ({itemCount} itens)</span>
                        <span>R${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
                        <span>Total</span>
                        <span>R${totalPrice.toFixed(2)}</span>
                    </div>
                    <button 
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-primary-500 text-white py-3 rounded-md mt-6 hover:bg-primary-600 transition">
                        Ir para o Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;