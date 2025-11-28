import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

type ThemeName = 'soft-blue' | 'lavender' | 'mint' | 'sunset' | 'ocean';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => Promise<void>;
  themes: { name: ThemeName; label: string; colors: { primary: string; secondary: string } }[];
}

const themes = [
  { name: 'soft-blue' as ThemeName, label: 'Soft Blue', colors: { primary: '220 85% 65%', secondary: '250 75% 70%' } },
  { name: 'lavender' as ThemeName, label: 'Lavender Dreams', colors: { primary: '270 70% 70%', secondary: '290 65% 75%' } },
  { name: 'mint' as ThemeName, label: 'Mint Fresh', colors: { primary: '160 60% 65%', secondary: '140 55% 70%' } },
  { name: 'sunset' as ThemeName, label: 'Sunset Glow', colors: { primary: '15 85% 70%', secondary: '330 75% 75%' } },
  { name: 'ocean' as ThemeName, label: 'Ocean Breeze', colors: { primary: '200 80% 60%', secondary: '190 70% 65%' } },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeName>('soft-blue');

  useEffect(() => {
    if (user) {
      // Load user's theme preference
      supabase
        .from('user_preferences')
        .select('theme')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.theme) {
            applyTheme(data.theme as ThemeName);
          }
        });
    }
  }, [user]);

  const applyTheme = (themeName: ThemeName) => {
    const selectedTheme = themes.find(t => t.name === themeName);
    if (selectedTheme) {
      document.documentElement.style.setProperty('--primary', selectedTheme.colors.primary);
      document.documentElement.style.setProperty('--secondary', selectedTheme.colors.secondary);
      setThemeState(themeName);
    }
  };

  const setTheme = async (themeName: ThemeName) => {
    applyTheme(themeName);
    
    if (user) {
      await supabase
        .from('user_preferences')
        .update({ theme: themeName })
        .eq('user_id', user.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
