import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Wrench,
  Layers,
  AlertCircle,
  CreditCard,
  FileText,
  Star,
  BarChart3,
  Bell,
  Settings,
  X,
  Compass,
  CheckSquare,
  Sparkles,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';

export type NavItemId =
  | 'dashboard'
  | 'bookings'
  | 'customers'
  | 'technicians'
  | 'services'
  | 'complaints'
  | 'payments'
  | 'invoices'
  | 'reviews'
  | 'reports'
  | 'notifications'
  | 'settings'
  | 'tech-portal'
  | 'customer-portal'
  | 'my-services'
  | 'ai-assistant';

interface SidebarProps {
  activeTab: NavItemId;
  setActiveTab: (tab: NavItemId) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { user, isAdmin, isTechnician, isCustomer } = useAuth();
  const { unreadCount } = useNotifications();

  interface NavItem {
    id: NavItemId;
    label: string;
    icon: React.ElementType;
    badge?: number;
  }

  // Primary sidebar navigation items
  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'technicians', label: 'Technicians', icon: Wrench },
    { id: 'services', label: 'Services', icon: Layers },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'reports', label: 'Analysis & Reports', icon: BarChart3 },
    { id: 'ai-assistant', label: 'AI Diagnostics', icon: Sparkles },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const technicianNavItems: NavItem[] = [
    { id: 'tech-portal', label: 'My Jobs & Schedule', icon: CheckSquare },
    { id: 'ai-assistant', label: 'Technician AI Copilot', icon: Sparkles },
    { id: 'bookings', label: 'All Assignments', icon: CalendarCheck },
    { id: 'reviews', label: 'My Ratings', icon: Star },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
  ];

  const customerNavItems: NavItem[] = [
    { id: 'customer-portal', label: 'Dashboard & Track', icon: Compass },
    { id: 'my-services', label: 'My Services', icon: CalendarCheck },
    { id: 'services', label: 'Browse Catalog', icon: Layers },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'complaints', label: 'My Complaints', icon: AlertCircle },
    { id: 'reviews', label: 'My Reviews', icon: Star },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
  ];

  const navItems = isTechnician
    ? technicianNavItems
    : isCustomer
    ? customerNavItems
    : adminNavItems;

  const handleSelect = (id: NavItemId) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 h-full bg-[#0F172A] flex flex-col p-6 space-y-6 rounded-r-[40px] text-slate-300 shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding Section */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-purple-900/40">
              S
            </div>
            <span className="text-white font-bold text-lg tracking-tight">SERVICEHUB</span>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Status Tag */}
        <div className="px-3 py-2 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isAdmin ? 'bg-purple-400' : isTechnician ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span className="text-xs font-medium text-slate-300 capitalize">
              {user?.role.toLowerCase()} Mode
            </span>
          </div>
          <span className="text-[10px] font-mono text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded-full border border-purple-700/50">
            PRO
          </span>
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 flex flex-col space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive ? 'bg-white text-[#7C3AED]' : 'bg-[#7C3AED] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card matching design HTML */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-600 border-2 border-slate-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white font-medium truncate">
                {user?.name || (isAdmin ? 'Prathamesh Deshmukh' : 'Operations Lead')}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@servicehub.com'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
