
import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { motion } from 'motion/react';

const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [pixKey, setPixKey] = useState(settings.pixKey);
  const [pixName, setPixName] = useState(settings.pixName);
  const [pixCity, setPixCity] = useState(settings.pixCity);
  const [enableCard, setEnableCard] = useState(settings.enableCard);
  const [bannerUrl, setBannerUrl] = useState(settings.bannerUrl);
  const [bannerTitle, setBannerTitle] = useState(settings.bannerTitle);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl);
  const [saved, setSaved] = useState(false);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      pixKey,
      pixName,
      pixCity,
      whatsapp,
      logoUrl,
      enableCard,
      bannerUrl,
      bannerTitle,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Configurações de Pagamento</h1>
        <p className="text-slate-500 font-light mt-1">Configure como você deseja receber os pagamentos dos seus clientes.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-12"
        >
          <form onSubmit={handleSave} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Identidade da Loja (Logo)
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">URL da Logo</label>
                  <input 
                    type="text" 
                    value={logoUrl} 
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://exemplo.com/logo.png"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500/10 transition-all outline-none text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-grow h-px bg-slate-100"></div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-300">ou</span>
                  <div className="flex-grow h-px bg-slate-100"></div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Carregar Logo do Computador</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full px-5 py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 group-hover:border-slate-300 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-sm text-slate-500 font-medium">Selecionar Logo</span>
                    </div>
                  </div>
                </div>
                {logoUrl && (
                  <div className="mt-4 flex justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <img src={logoUrl} alt="Preview da Logo" className="h-16 object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5l-1.043 2.5m6.041 2.5l-1.043-2.5" />
                  </svg>
                </div>
                Configuração do WhatsApp
              </h2>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Número do WhatsApp (com DDD)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                    <span className="text-slate-400 font-bold">+</span>
                  </div>
                  <input 
                    type="text" 
                    value={whatsapp} 
                    onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 5511999999999"
                    className="w-full pl-10 pr-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/10 transition-all outline-none text-slate-800"
                  />
                </div>
                <p className="text-[10px] text-slate-400 ml-1">Os pedidos serão enviados para este número.</p>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Configuração do PIX (Opcional)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Chave PIX (CPF, E-mail ou Aleatória)</label>
                  <input 
                    type="text" 
                    value={pixKey} 
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Sua chave PIX aqui"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Nome do Beneficiário</label>
                  <input 
                    type="text" 
                    value={pixName} 
                    onChange={(e) => setPixName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-slate-800"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Cidade</label>
                <input 
                  type="text" 
                  value={pixCity} 
                  onChange={(e) => setPixCity(e.target.value)}
                  placeholder="Ex: Sao Paulo"
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Banner da Loja
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">Título do Banner</label>
                  <input 
                    type="text" 
                    value={bannerTitle} 
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="Ex: Coleção de Inverno"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/10 transition-all outline-none text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 ml-1">URL da Imagem do Banner</label>
                  <input 
                    type="text" 
                    value={bannerUrl} 
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://exemplo.com/banner.png"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500/10 transition-all outline-none text-slate-800"
                  />
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
                      onChange={handleBannerFileChange}
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
                {bannerUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 aspect-[21/9]">
                    <img src={bannerUrl} alt="Preview do Banner" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 space-y-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                Cartão de Crédito
              </h2>
              
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                <div>
                  <p className="font-bold text-slate-900">Habilitar Pagamento com Cartão</p>
                  <p className="text-sm text-slate-500">Permite que clientes paguem via cartão (Simulado).</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setEnableCard(!enableCard)}
                  className={`w-14 h-8 rounded-full transition-colors relative ${enableCard ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${enableCard ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8">
              {saved && (
                <motion.p 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-emerald-600 font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Configurações salvas com sucesso!
                </motion.p>
              )}
              <div className="flex-grow" />
              <button 
                type="submit"
                className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-semibold hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
              >
                Salvar Configurações
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;
