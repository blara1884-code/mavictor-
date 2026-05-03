
import React from 'react';
import { Link } from 'react-router-dom';

const OrderConfirmation: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-20 flex items-center justify-center">
      <div className="text-center bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-black/5 max-w-xl mx-auto border border-slate-50">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Pedido Recebido!</h1>
        <p className="text-slate-500 font-light mb-8">Seu pedido foi registrado e uma conversa no WhatsApp foi aberta para finalização.</p>
        
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 mb-10">
          <div className="flex items-center gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Finalização no WhatsApp</p>
              <p className="text-xs text-slate-400 font-medium">Verifique a conversa aberta para confirmar o pagamento.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
            <Link 
                to="/" 
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-slate-800 transition-all shadow-xl shadow-black/10"
            >
                Voltar para a Loja
            </Link>
            <Link 
                to="/orders" 
                className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-bold text-sm tracking-widest uppercase hover:bg-slate-100 transition-all"
            >
                Meus Pedidos
            </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;