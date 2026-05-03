
import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../contexts/ProductContext';
import type { Product } from '../../types';

const ProductForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { getProductById, addProduct, updateProduct } = useProducts();
    
    const categories = [
        "Camisas", "Camisetas", "Calças", "Bermudas", "Shorts", "Saias", 
        "Vestidos", "Moletons", "Jaquetas", "Blusas", "Roupas íntimas", "Moda esportiva"
    ];

    const [product, setProduct] = useState<Omit<Product, 'id'>>({
        name: '',
        description: '',
        price: 0,
        stock_quantity: 0,
        category: 'Camisas',
        image_url: '',
        sizes: []
    });

    const availableSizes = ['P', 'M', 'G', 'GG', 'XG', '38', '40', '42', '44', '46', 'Único'];

    const toggleSize = (size: string) => {
        setProduct(prev => {
            const currentSizes = prev.sizes || [];
            if (currentSizes.includes(size)) {
                return { ...prev, sizes: currentSizes.filter(s => s !== size) };
            } else {
                return { ...prev, sizes: [...currentSizes, size] };
            }
        });
    };

    // Calculadora de Preço
    const [calc, setCalc] = useState({ cost: 0, markup: 30 });
    const calculatedPrice = (calc.cost * (1 + calc.markup / 100)).toFixed(2);

    const isEditing = Boolean(id);

    useEffect(() => {
        if (isEditing && id) {
            const existingProduct = getProductById(parseInt(id, 10));
            if (existingProduct) {
                setProduct(existingProduct);
            }
        }
    }, [id, isEditing, getProductById]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numericFields = ['price', 'stock_quantity'];
        setProduct(prev => ({ 
            ...prev, 
            [name]: numericFields.includes(name) ? parseFloat(value) || 0 : value 
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProduct(prev => ({ ...prev, image_url: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && id) {
                await updateProduct({ ...product, id: parseInt(id, 10) } as Product);
            } else {
                await addProduct(product);
            }
            navigate('/admin/dashboard');
        } catch (error) {
            console.error("Falha ao salvar o produto:", error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{isEditing ? 'Editar Produto' : 'Novo Produto'}</h1>
                <p className="text-slate-500 font-light mt-1">Preencha as informações abaixo para gerenciar seu inventário.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Nome do Produto</label>
                            <input type="text" name="name" id="name" value={product.name} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all outline-none text-slate-800 placeholder:text-slate-300" placeholder="Ex: Camiseta Premium" required />
                        </div>
                         <div className="space-y-2">
                            <label htmlFor="category" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Categoria</label>
                            <select 
                                name="category" 
                                id="category" 
                                value={product.category} 
                                onChange={(e) => setProduct(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all outline-none text-slate-800"
                                required
                            >
                                {categories.map((cat, index) => (
                                    <option key={index} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400">Calculadora de Preço Sugerido</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-medium">Custo (R$)</label>
                                <input 
                                    type="number" 
                                    value={calc.cost} 
                                    onChange={(e) => setCalc(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 font-medium">Margem (%)</label>
                                <input 
                                    type="number" 
                                    value={calc.markup} 
                                    onChange={(e) => setCalc(prev => ({ ...prev, markup: parseFloat(e.target.value) || 0 }))}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                            <span className="text-xs font-medium text-slate-600">Preço Sugerido: <span className="text-slate-900 font-bold">R$ {calculatedPrice}</span></span>
                            <button 
                                type="button"
                                onClick={() => setProduct(prev => ({ ...prev, price: parseFloat(calculatedPrice) }))}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                            >
                                Aplicar Preço
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Descrição Detalhada</label>
                        <textarea name="description" id="description" value={product.description} onChange={handleChange} rows={4} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all outline-none text-slate-800 placeholder:text-slate-300" placeholder="Descreva as características do produto..." required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Tamanhos Disponíveis</label>
                        <div className="flex flex-wrap gap-2">
                            {availableSizes.map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                        product.sizes?.includes(size)
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        {(!product.sizes || product.sizes.length === 0) && (
                            <p className="text-[10px] text-amber-500 font-medium ml-1 mt-1 font-mono uppercase tracking-widest">Aviso: Selecione os tamanhos que estarão disponíveis para compra.</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label htmlFor="price" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Preço de Venda (R$)</label>
                            <input type="number" name="price" id="price" value={product.price} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all outline-none text-slate-800 placeholder:text-slate-300" required min="0" step="0.01"/>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="stock_quantity" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Quantidade em Estoque</label>
                            <input type="number" name="stock_quantity" id="stock_quantity" value={product.stock_quantity} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all outline-none text-slate-800 placeholder:text-slate-300" required min="0"/>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="image_url" className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">URL da Imagem</label>
                            <input type="text" name="image_url" id="image_url" value={product.image_url} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all outline-none text-slate-800 placeholder:text-slate-300" placeholder="https://picsum.photos/seed/..." required />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex-grow h-px bg-slate-100"></div>
                            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">ou</span>
                            <div className="flex-grow h-px bg-slate-100"></div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Carregar do Computador</label>
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-full px-5 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 group-hover:border-slate-300 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span className="text-sm text-slate-500 font-medium">Selecionar Arquivo</span>
                                </div>
                            </div>
                        </div>
                        {product.image_url && (
                            <div className="mt-4 w-32 h-32 rounded-2xl overflow-hidden border border-slate-100">
                                <img src={product.image_url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-slate-50">
                        <button type="button" onClick={() => navigate('/admin/dashboard')} className="px-8 py-4 text-slate-400 font-semibold hover:text-slate-900 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-200">
                            {isEditing ? 'Salvar Alterações' : 'Adicionar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;