import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext';
import { Sun, Moon, Globe, UserCheck, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user, role, switchPersona } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/dashboard':
        return t('navDashboard');
      case '/marketplace':
        return t('navMarketplace');
      case '/my-listings':
        return t('navMyListings');
      case '/orders':
        return t('navOrders');
      case '/offers':
        return t('navOffers');
      case '/market':
        return t('navMarketPrices');
      case '/admin':
        return t('navAdmin');
      case '/chat':
        return 'AI Workspace';
      case '/profile':
        return t('navProfile');
      case '/settings':
        return t('navSettings');
      case '/weather':
        return 'Weather Intel';
      case '/disease':
        return 'Disease Scanner';
      case '/schemes':
        return 'Gov Schemes';
      case '/analytics':
        return 'Soil Analytics';
      default:
        return 'KisanSetu';
    }
  };

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-900 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb Title */}
      <div>
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          {getBreadcrumb()}
        </h2>
      </div>

      {/* Action Utility Bar */}
      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <Globe className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg font-bold transition ${
              language === 'en' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('mr')}
            className={`px-2 py-1 rounded-lg font-bold transition ${
              language === 'mr' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            मराठी
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2 py-1 rounded-lg font-bold transition ${
              language === 'hi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            हिंदी
          </button>
        </div>

        {/* Demo Persona Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition hover:bg-emerald-100"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{user.fullName} ({role})</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {personaMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-2 z-50">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2.5 py-1.5">
                Switch Test Persona
              </p>
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.phone}
                  onClick={() => {
                    switchPersona(p.phone);
                    setPersonaMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex flex-col transition ${
                    user.phone === p.phone
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="leading-tight">{p.label}</span>
                  <span className={`text-[10px] mt-0.5 ${user.phone === p.phone ? 'text-emerald-100' : 'text-zinc-400'}`}>
                    {p.location}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 transition border border-zinc-200 dark:border-zinc-800"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Profile Avatar Badge */}
        <div
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xs shadow-sm cursor-pointer"
        >
          {user.fullName.substring(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
