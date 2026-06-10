import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

type Lang = 'vi' | 'en';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('mis_lang') as Lang) || 'vi';
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('mis_lang', newLang);
  };

  // Safe translation resolver
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[lang];
    
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        // Fallback to key or resolve in Vietnamese dictionary first, then key
        let viFallback: any = translations['vi'];
        for (const vk of keys) {
          if (viFallback && viFallback[vk] !== undefined) {
            viFallback = viFallback[vk];
          } else {
            viFallback = null;
            break;
          }
        }
        return typeof viFallback === 'string' ? viFallback : key;
      }
    }
    return typeof result === 'string' ? result : key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
