
import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MenuIcon from '../icons/MenuIcon';
import XIcon from '../icons/XIcon';
// LiveIndicator import removed

const Sidebar: React.FC<{isOpen: boolean; onClose: () => void}> = ({isOpen, onClose}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/admin/login');
  };

  const linkClasses = "flex items-center p-3 my-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200";
  const activeLinkClasses = "bg-white/10 text-white font-medium shadow-sm";

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      <div className={`bg-slate-950 text-white w-72 min-h-screen flex flex-col fixed z-40 transform transition-transform duration-300 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-slate-950 rounded-sm"></div>
            </div>
            <span className="text-lg font-light tracking-tight">Admin<span className="font-bold">Panel</span></span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-grow p-6 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-4 ml-3">Menu Principal</div>
          <NavLink to="/admin/dashboard" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products/new" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Novo Produto
          </NavLink>
          <NavLink to="/admin/sales" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Relatórios
          </NavLink>
          <NavLink to="/admin/settings" onClick={onClose} className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Configurações
          </NavLink>
          
          <div className="pt-4 mt-4 border-t border-white/5">
            <NavLink to="/" onClick={onClose} className="flex items-center p-3 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              Ir para Página do Cliente
            </NavLink>
          </div>
        </nav>
        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/10 transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sair do Sistema
          </button>
        </div>
      </div>
    </>
  );
};

const AdminHeader: React.FC<{onMenuClick: () => void}> = ({onMenuClick}) => {
    const navigate = useNavigate();
    return (
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 z-20 lg:hidden flex items-center justify-between">
            <button onClick={onMenuClick} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <MenuIcon className="h-6 w-6 text-slate-600" />
            </button>
            <span className="font-bold text-slate-900">AdminPanel</span>
            <button 
              onClick={() => navigate('/')}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Ir para Página do Cliente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </button>
        </header>
    );
};

const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-grow flex flex-col lg:ml-72">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="flex justify-end px-6 pt-4">
            {/* Status indicator removed */}
        </div>
        <main className="flex-grow">
          <div className="p-6 sm:p-10 max-w-7xl mx-auto w-full">
              <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
