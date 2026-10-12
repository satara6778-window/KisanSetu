import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppState } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Sprout, 
  LayoutDashboard, 
  ShoppingBag,
  Package,
  Truck,
  Handshake,
  BarChart3,
  MessageSquare,
  ShieldAlert,
  User, 
  Settings as SettingsIcon, 
  ChevronLeft, 
  ChevronRight, 
  CloudSun,
  ShieldCheck,
  Landmark
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed } = useAppState();
  const { t } = useLanguage();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const marketplaceNavItems = [
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/marketplace', label: t('navMarketplace'), icon: ShoppingBag },
    { to: '/my-listings', label: t('navMyListings'), icon: Package },
    { to: '/orders', label: t('navOrders'), icon: Truck },
    { to: '/offers', label: t('navOffers'), icon: Handshake },
    { to: '/market', label: t('navMarketPrices'), icon: BarChart3 },
  ];

  const toolsNavItems = [
    { to: '/chat', label: t('navChat'), icon: MessageSquare },
    { to: '/admin', label: t('navAdmin'), icon: ShieldAlert },
    { to: '/weather', label: 'Weather Intel', icon: CloudSun },
    { to: '/disease', label: 'Disease Scanner', icon: ShieldCheck },
    { to: '/schemes', label: 'Gov Schemes', icon: Landmark },
  ];

  const bottomNavItems = [
    { to: '/profile', label: t('navProfile'), icon: User },
    { to: '/settings', label: t('navSettings'), icon: SettingsIcon },
  ];

  const NavItem = ({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) => (
    <NavLink
      to={to}
      title={sidebarCollapsed ? label : undefined}
      className={({ isActive }) => 
        `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
          isActive 
            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20' 
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100'
        }`
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {!sidebarCollapsed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="truncate leading-none"
        >
          {label}
        </motion.span>
      )}
    </NavLink>
  );

  const SectionLabel = ({ label }: { label: string }) => (
    !sidebarCollapsed ? (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest px-3 pt-3 pb-1"
      >
        {label}
      </motion.p>
    ) : (
      <div className="border-t border-zinc-200 dark:border-zinc-800/60 my-2 mx-2" />
    )
  );

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex-shrink-0 h-screen bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-900 flex flex-col overflow-hidden relative sticky top-0 z-40"
    >
      {/* Top Header Section */}
      <div className="p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" onClick={() => navigate('/marketplace')}>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 flex-shrink-0">
              <Sprout className="w-4.5 h-4.5" />
            </div>
            {!sidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-extrabold text-zinc-900 dark:text-white text-base tracking-tight truncate"
              >
                Kisan<span className="text-emerald-600 dark:text-emerald-400">Setu</span>
              </motion.span>
            )}
          </div>
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-6 h-6 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center text-zinc-500 dark:text-zinc-400 absolute -right-3 top-6 bg-white dark:bg-zinc-950 z-20 shadow-sm flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-2 space-y-1">
        {/* Marketplace Section */}
        <SectionLabel label="Marketplace" />
        <nav className="flex flex-col gap-1">
          {marketplaceNavItems.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>

        {/* Advisory & Tools */}
        <SectionLabel label="Trust & Tools" />
        <nav className="flex flex-col gap-1">
          {toolsNavItems.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>
      </div>

      {/* Bottom Fixed Section */}
      <div className="flex-shrink-0 px-3 pb-2 border-t border-zinc-200 dark:border-zinc-900 pt-2">
        <nav className="flex flex-col gap-1">
          {bottomNavItems.map((item) => <NavItem key={item.to} {...item} />)}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="flex-shrink-0 p-3 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-100/50 dark:bg-zinc-950/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center text-white font-bold text-[11px] shadow-sm flex-shrink-0"
          >
            {user.fullName.substring(0, 2).toUpperCase()}
          </div>
          {!sidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-hidden min-w-0"
            >
              <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate leading-tight">
                {user.fullName}
              </p>
              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold leading-tight mt-0.5">
                {role} · {user.village}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
