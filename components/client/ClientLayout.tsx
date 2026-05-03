
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';
import { useSettings } from '../../contexts/SettingsContext';
import ShoppingCartIcon from '../icons/ShoppingCartIcon';
import HeartIcon from '../icons/HeartIcon';
import UserIcon from '../icons/UserIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import SearchIcon from '../icons/SearchIcon';
import MenuIcon from '../icons/MenuIcon';
import XIcon from '../icons/XIcon';
import type { User } from '../../types';
// LiveIndicator import removed

const MobileMenu: React.FC<{onClose: () => void, user: User | null, onLogout: () => void}> = ({onClose, user, onLogout}) => {
    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={onClose}><XIcon className="h-6 w-6" /></button>
            </div>
            <nav className="flex-grow p-4 space-y-4">
                 <Link to="/" onClick={onClose} className="block py-2 text-gray-700 hover:text-primary-600">Página Inicial</Link>
                 {user && user.role === 'client' && (
                     <Link to="/orders" onClick={onClose} className="block py-2 text-gray-700 hover:text-primary-600">Meus Pedidos</Link>
                 )}
                 <Link to="#" onClick={onClose} className="block py-2 text-gray-700 hover:text-primary-600">Feminino</Link>
                 <Link to="#" onClick={onClose} className="block py-2 text-brand-orange hover:text-primary-600">Ofertas</Link>
                 <Link to="#" onClick={onClose} className="block py-2 text-gray-700 hover:text-primary-600">Lista de Desejos</Link>
                 <hr/>
                 {user && user.role === 'client' ? (
                     <button onClick={() => { onLogout(); onClose(); }} className="w-full text-left py-2 text-gray-700 hover:text-primary-600">
                         Sair
                     </button>
                 ) : (
                     <Link to="/login" onClick={onClose} className="block py-2 text-gray-700 hover:text-primary-600">
                         Entrar / Cadastrar
                     </Link>
                 )}
            </nav>
        </div>
    );
};


const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const { settings } = useSettings();
    const { searchTerm, setSearchTerm } = useProducts();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const categories = [
        "Camisas", "Camisetas", "Calças", "Bermudas", "Shorts", "Saias", 
        "Vestidos", "Moletons", "Jaquetas", "Blusas", "Roupas íntimas", "Moda esportiva"
    ];

    return (
        <header className="bg-white sticky top-0 z-40 border-b">
             {isMenuOpen && <MobileMenu onClose={() => setIsMenuOpen(false)} user={user} onLogout={handleLogout}/>}
            <div className="bg-gray-100 text-center text-xs py-1">
                <a href="#" className="hover:underline">netshoes</a>
            </div>
            <div className="bg-primary-900 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-end pt-2">
                        {/* Status indicator removed */}
                    </div>
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between h-16 lg:hidden">
                        <button onClick={() => setIsMenuOpen(true)}>
                            <MenuIcon className="h-6 w-6"/>
                        </button>
                         <Link to="/" className="flex items-center">
                            {settings.logoUrl ? (
                                <img src={settings.logoUrl} alt="Store logo" className="h-12 w-auto object-contain" />
                            ) : (
                                <span className="text-2xl font-bold tracking-tighter text-white">MaVictor</span>
                            )}
                        </Link>
                        <div className="flex items-center space-x-4">
                           <SearchIcon className="h-6 w-6"/>
                           <Link to="/login">
                                <UserIcon className="h-6 w-6"/>
                           </Link>
                           <Link to="/cart" className="relative hover:text-gray-300 transition">
                               <ShoppingCartIcon className="h-7 w-7" />
                               {itemCount > 0 && (
                                   <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                       {itemCount}
                                   </span>
                               )}
                           </Link>
                        </div>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden lg:flex items-center justify-between h-20">
                        <div className="flex-shrink-0">
                            <Link to="/" className="flex items-center">
                                {settings.logoUrl ? (
                                    <img src={settings.logoUrl} alt="Store logo" className="h-16 w-auto object-contain" />
                                ) : (
                                    <span className="text-3xl font-black tracking-tighter text-white">MaVictor Loja</span>
                                )}
                            </Link>
                        </div>
                        <div className="flex-grow max-w-xl mx-8">
                           <div className="relative">
                               <input 
                                   type="text" 
                                   placeholder="O que você procura hoje?" 
                                   className="w-full bg-white text-black py-2 px-4 rounded-sm focus:outline-none"
                                   value={searchTerm}
                                   onChange={handleSearchChange}
                               />
                               <SearchIcon className="h-6 w-6 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2"/>
                           </div>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                           <a href="#" className="flex items-center space-x-1 hover:text-gray-300">
                               <HeartIcon className="w-6 h-6"/>
                               <span>Lista de Desejos</span>
                           </a>
                           <div className="flex items-center space-x-1">
                               {user && user.role === 'client' ? (
                                    <div className="flex items-center space-x-4">
                                        <Link to="/orders" className="flex items-center space-x-1 hover:text-gray-300">
                                            <ShoppingCartIcon className="w-5 h-5"/>
                                            <span>Meus Pedidos</span>
                                        </Link>
                                        <div className="flex items-center space-x-1">
                                            <UserIcon className="w-6 h-6"/>
                                            <button onClick={handleLogout} className="hover:text-gray-300 transition">
                                                Sair
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <Link to="/login" className="flex items-center hover:text-gray-300 transition">
                                        <UserIcon className="w-6 h-6 mr-1"/>
                                        <span>Entrar</span>
                                        <ChevronDownIcon className="w-4 h-4"/>
                                    </Link>
                                )}
                           </div>
                            <Link to="/cart" className="relative hover:text-gray-300 transition">
                                <ShoppingCartIcon className="h-7 w-7" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                     <div className="hidden lg:flex items-center justify-center h-12 text-sm">
                         <div className="flex items-center space-x-8 font-semibold">
                            <div className="relative group">
                                <a href="#" className="hover:text-gray-300 py-3 inline-flex items-center">
                                    Feminino
                                    <ChevronDownIcon className="w-4 h-4 ml-1"/>
                                </a>
                                <div className="absolute hidden group-hover:block bg-white text-primary-900 shadow-lg rounded-b-md mt-0 w-48 z-50 py-2">
                                    {categories.map(category => (
                                        <a key={category} href="#" className="block px-4 py-2 text-sm hover:bg-primary-100">
                                            {category}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <a href="#" className="hover:text-gray-300 text-brand-orange">Ofertas</a>
                         </div>
                     </div>
                </div>
            </div>
        </header>
    );
};

const Footer: React.FC = () => {
    return (
        <footer className="bg-primary-900 text-white mt-auto">
            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} MaVictor Loja. Todos os direitos reservados.</p>
                    <div className="flex items-center gap-6">
                        <Link to="/admin/login" className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-[0.2em] font-bold">Acesso Admin</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const ClientLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default ClientLayout;
