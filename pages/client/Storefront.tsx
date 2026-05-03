
import React, { useMemo } from 'react';
// FIX: import useNavigate to handle navigation for products with multiple sizes
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import { useCart } from '../../contexts/CartContext';
import { useSettings } from '../../contexts/SettingsContext';
import type { Product } from '../../types';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const { addToCart } = useCart();
    const navigate = useNavigate();

    // FIX: This handler now manages both adding to cart and navigating to product details
    // depending on whether the product has multiple sizes that require user selection.
    const handleAddToCart = () => {
            // Lógica de tamanho foi removida por enquanto, sempre navega para a página do produto
            // para uma futura implementação de seleção de opções mais complexa.
            // Adiciona diretamente ao carrinho com um tamanho padrão.
            addToCart(product, 1, 'Único');
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-1 group">
            <Link to={`/product/${product.id}`} className="block">
                <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                    {/* A categoria será adicionada de volta quando buscarmos os dados da tabela de categorias */}
                    <p className="text-xl font-bold text-gray-900 mt-2">R${product.price.toFixed(2)}</p>
                </div>
            </Link>
            <div className="px-4 pb-4">
                 <button 
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                    className="w-full bg-primary-500 text-white py-2 rounded-md hover:bg-primary-600 transition disabled:bg-primary-300 disabled:cursor-not-allowed">
                    {product.stock_quantity > 0 ? 'Adicionar ao Carrinho' : 'Esgotado'}
                </button>
            </div>
        </div>
    );
};

const HeroBanner: React.FC = () => {
    const { settings } = useSettings();
    return (
        <div className="relative w-full overflow-hidden bg-brand-pink h-[350px] md:h-[500px]">
            <div className="absolute top-0 right-0 h-full w-1/2 bg-brand-orange"></div>
            
            <div className="container mx-auto h-full relative px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-full">
                    <div className="w-1/2 z-10">
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-gray-800 leading-tight">
                            {settings.bannerTitle}
                        </h1>
                        <button className="mt-4 md:mt-8 bg-primary-900 text-white py-2 px-6 md:py-3 md:px-10 rounded-sm text-base md:text-lg font-semibold hover:bg-primary-800 transition uppercase">
                            comprar agora
                        </button>
                        <p className="text-xs md:text-sm text-gray-600 mt-2">Imagem ilustrativa</p>
                    </div>

                    <div className="absolute right-0 bottom-0 h-full w-2/3">
                        <img 
                            src={settings.bannerUrl}
                            alt={settings.bannerTitle}
                            className="h-full w-full object-contain object-right-bottom"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};


const Storefront: React.FC = () => {
    const { products, loading, error, searchTerm, fetchProducts } = useProducts();

    const filteredProducts = useMemo(() => {
        if (!searchTerm) {
            return products;
        }
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    if (loading) return <div className="text-center text-xl py-10">Carregando produtos...</div>;
    if (error) return <div className="text-center text-xl text-red-500 py-10">{error}</div>;

    return (
        <div>
            {!searchTerm && <HeroBanner />}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {searchTerm ? `Resultados para "${searchTerm}"` : 'Nossos Produtos'}
                    </h2>
                    <button 
                        onClick={() => fetchProducts()}
                        className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        Atualizar
                    </button>
                </div>
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-3xl font-semibold text-gray-800">Nenhum produto encontrado</h2>
                        <p className="text-gray-500 mt-2">
                            Não encontramos nenhum produto correspondente a "{searchTerm}". Tente uma busca diferente.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Storefront;
