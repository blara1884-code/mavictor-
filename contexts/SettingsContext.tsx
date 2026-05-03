
import React, { createContext, useState, useContext, useEffect } from 'react';
import socket from '../src/socket';

interface StoreSettings {
  pixKey: string;
  pixName: string;
  pixCity: string;
  whatsapp: string;
  logoUrl: string;
  enableCard: boolean;
  bannerUrl: string;
  bannerTitle: string;
}

interface SettingsContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: StoreSettings = {
  pixKey: '',
  pixName: 'Loja Exemplo',
  pixCity: 'Sao Paulo',
  whatsapp: '',
  logoUrl: '',
  enableCard: true,
  bannerUrl: 'https://i.imgur.com/vPqgz76.png',
  bannerTitle: 'Camisetas e polos',
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  const fetchSettings = async () => {
    try {
      // Supabase usage example:
      // import { supabase } from '../src/lib/supabase';
      // const { data } = await supabase.from('settings').select('*').single();
      
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (e) {
      console.error("Erro ao carregar configurações", e);
    }
  };

  useEffect(() => {
    fetchSettings();

    const onSettingsUpdated = (updatedSettings: StoreSettings) => {
      setSettings(updatedSettings);
    };

    const onConnect = () => {
      console.log("Socket connected, refetching settings...");
      fetchSettings();
    };

    socket.on("settings_updated", onSettingsUpdated);
    socket.on("connect", onConnect);

    return () => {
      socket.off("settings_updated", onSettingsUpdated);
      socket.off("connect", onConnect);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings)
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (e) {
      console.error("Erro ao atualizar configurações", e);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
