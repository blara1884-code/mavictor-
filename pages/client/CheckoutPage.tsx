
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';

const CheckoutPage: React.FC = () => {
  const { cart, totalPrice, checkout } = useCart();
  const { user, loading: authLoading } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'cash'>('pix');
  const [fullName, setFullName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, authLoading, navigate]);

  const handleCheckout = async () => {
    if (!fullName || fullName.trim().length < 3) {
      alert("Por favor, preencha o seu nome completo para prosseguir.");
      return;
    }

    setIsProcessing(true);
    
    // Construct WhatsApp message
    const orderItemsText = cart.map(item => 
      `• ${item.quantity}x ${item.product.name} (${item.size}) - R$ ${(item.product.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const paymentMethodText = {
      'pix': 'PIX',
      'card': 'Cartão de Crédito',
      'cash': 'Dinheiro (Pagamento na Entrega)'
    }[paymentMethod];

    const message = `*Novo Pedido - MaVictor Loja*\n\n` +
      `*Cliente:* ${fullName}\n` +
      `*Email:* ${user.email}\n` +
      `*Data:* ${new Date().toLocaleDateString()}\n\n` +
      `*Itens do Pedido:*\n${orderItemsText}\n\n` +
      `*Total: R$ ${totalPrice.toFixed(2)}*\n` +
      `*Forma de Pagamento:* ${paymentMethodText}\n\n` +
      `_O cliente enviou o pedido e aguarda instruções._`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${settings.whatsapp || '5588999126218'}?text=${encodedMessage}`;

    const success = await checkout(paymentMethod, fullName);
    setIsProcessing(false);
    
    if (success) {
      // Open WhatsApp in a new tab first
      window.open(whatsappUrl, '_blank');
      // Then navigate to order confirmation on the current tab
      navigate('/order-confirmation');
    } else {
      alert('Falha no checkout. Tente novamente.');
    }
  };
  
  if (authLoading || !user) {
     return <div className="text-center p-20 font-light text-slate-400">Autenticando...</div>;
  }

  if (cart.length === 0) {
    return (
        <div className="text-center p-20">
            <h1 className="text-2xl font-light text-slate-900 mb-6">Seu carrinho está vazio.</h1>
            <button 
              onClick={() => navigate('/')} 
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-black transition-all"
            >
                Explorar Coleção
            </button>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Finalizar Compra</h1>
        <p className="text-slate-500 font-light mt-2">Revise seus itens e escolha a melhor forma de pagamento.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          {/* Entrega */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center text-sm">1</div>
              Informações de Entrega
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">E-mail</label>
                <input type="email" value={user.email} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-500 outline-none" readOnly />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  placeholder="Seu nome completo" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all outline-none text-slate-800" 
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 ml-1">Endereço de Entrega</label>
                <input type="text" placeholder="Rua, número, bairro..." className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-slate-900/5 transition-all outline-none text-slate-800" />
              </div>
            </div>
          </section>

          {/* Pagamento */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-50 text-slate-900 rounded-lg flex items-center justify-center text-sm">2</div>
              Forma de Pagamento
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <button 
                onClick={() => setPaymentMethod('pix')}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'pix' ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${paymentMethod === 'pix' ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-sm font-bold uppercase tracking-widest ${paymentMethod === 'pix' ? 'text-emerald-700' : 'text-slate-500'}`}>PIX</span>
              </button>

              <button 
                onClick={() => setPaymentMethod('card')}
                disabled={!settings.enableCard}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 disabled:opacity-30 ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className={`text-sm font-bold uppercase tracking-widest ${paymentMethod === 'card' ? 'text-blue-700' : 'text-slate-500'}`}>Cartão</span>
              </button>

              <button 
                onClick={() => setPaymentMethod('cash')}
                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'cash' ? 'border-amber-500 bg-amber-50/30' : 'border-slate-50 bg-slate-50/50 hover:bg-slate-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${paymentMethod === 'cash' ? 'text-amber-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className={`text-sm font-bold uppercase tracking-widest ${paymentMethod === 'cash' ? 'text-amber-700' : 'text-slate-500'}`}>Dinheiro</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={paymentMethod}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    paymentMethod === 'pix' ? 'bg-emerald-100 text-emerald-600' : 
                    paymentMethod === 'card' ? 'bg-blue-100 text-blue-600' : 
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {paymentMethod === 'pix' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {paymentMethod === 'card' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                    {paymentMethod === 'cash' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Finalizar pedido via {
                      paymentMethod === 'pix' ? 'PIX' : 
                      paymentMethod === 'card' ? 'Cartão' : 
                      'Dinheiro'
                    }</h3>
                    <p className="text-sm text-slate-500 font-light">Seu pedido será enviado para o WhatsApp para finalização.</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-200/60">
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Ao clicar em "Finalizar no WhatsApp", uma conversa será aberta com o resumo do seu pedido. 
                    Lá você receberá as instruções finais para o pagamento via {
                      paymentMethod === 'pix' ? 'PIX' : 
                      paymentMethod === 'card' ? 'Link de Cartão' : 
                      'Dinheiro (na entrega)'
                    }.
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white sticky top-10 shadow-2xl shadow-slate-200">
            <h2 className="text-2xl font-bold mb-8 tracking-tight">Resumo do Pedido</h2>
            
            <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.product.id + item.size} className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{item.size} • Qtd: {item.quantity}</p>
                  </div>
                  <span className="font-medium text-sm">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-white/10 pt-8">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Entrega</span>
                <span className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Grátis</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="text-lg font-light">Total</span>
                <span className="text-3xl font-bold tracking-tighter">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing || !fullName.trim() || (paymentMethod === 'pix' && !settings.pixKey)}
              className="w-full mt-10 py-5 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/20"
            >
              {isProcessing ? 'Processando...' : !fullName.trim() ? 'Informe seu Nome' : 'Finalizar no WhatsApp'}
            </button>
            
            {paymentMethod === 'pix' && !settings.pixKey && (
              <p className="mt-4 text-center text-xs text-red-400 font-medium">Aguardando configuração do PIX pelo administrador.</p>
            )}
            
            <p className="mt-6 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">Ambiente de Demonstração</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
