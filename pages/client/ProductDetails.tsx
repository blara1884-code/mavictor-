
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { motion } from 'motion/react';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProductById } = useProducts();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [shake, setShake] = useState(false);

  const product = id ? getProductById(parseInt(id, 10)) : undefined;

  if (!product) {
    return <div className="text-center text-2xl mt-10">Produto não encontrado.</div>;
  }
  
  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setError('Por favor, selecione um tamanho antes de adicionar ao carrinho.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
    }

    addToCart(product, quantity, selectedSize || 'Único');
    setAdded(true);
    setError(null);
    setTimeout(() => setAdded(false), 2000);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) return;
    const value = Math.max(1, Math.min(product.stock_quantity, Number(e.target.value)));
    setQuantity(value);
  }
  


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img src={product.image_url} alt={product.name} className="w-full h-auto rounded-lg object-cover" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-3xl font-light text-gray-900 mb-6">R${product.price.toFixed(2)}</p>
              <p className="text-gray-700 mb-6">{product.description}</p>

              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-8">
                  <label className="block text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Selecione o Tamanho
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setError(null);
                        }}
                        className={`min-w-[48px] h-12 rounded-xl transition-all font-bold flex items-center justify-center border-2 ${
                          selectedSize === size
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {error && <p className="text-red-500 text-xs mt-2 font-bold uppercase tracking-widest">{error}</p>}
                </div>
              )}

              <div className="flex items-center space-x-4 mb-6">
                <label htmlFor="quantity" className="font-semibold">Quantidade:</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max={product.stock_quantity}
                  className="w-20 border border-gray-300 rounded-md p-2 text-center"
                  disabled={product.stock_quantity === 0}
                />
                 <p className="text-sm text-gray-600">{product.stock_quantity} em estoque</p>
              </div>
              
              <div className="flex space-x-4">
                <motion.button
                  animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all active:scale-[0.98] ${
                    added ? 'bg-emerald-500 text-white' : 
                    (product.stock_quantity > 0 
                      ? (product.sizes?.length && !selectedSize ? 'bg-slate-100 text-slate-400 border-2 border-dashed border-slate-200' : 'bg-slate-900 text-white shadow-xl shadow-black/10 hover:bg-slate-800') 
                      : 'bg-slate-100 text-slate-300 cursor-not-allowed')
                  }`}
                  disabled={product.stock_quantity === 0 || added}
                >
                  {added ? '✓ Adicionado!' : 
                   (product.stock_quantity > 0 
                     ? (product.sizes?.length && !selectedSize ? 'Escolha o Tamanho' : 'Adicionar ao Carrinho') 
                     : 'Esgotado')}
                </motion.button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-slate-50 text-slate-400 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ProductDetails;
