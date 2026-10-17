import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Check,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { UserRole } from '../../types/index.ts';

interface HeaderProps {
  pageTitle: string;
  onOpenMobileSidebar: () => void;
  onOpenNewBookingModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  onOpenMobileSidebar,
  onOpenNewBookingModal,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, demoLogin, logout, isAdmin, isTechnician, isCustomer } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleSwitcher(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchRole = async (targetRole: UserRole) => {
    setShowRoleSwitcher(false);
    await demoLogin(targetRole);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#f8fafc]/90 backdrop-blur-md px-4 sm:px-8 py-4 border-b border-slate-200/60 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-200/80 transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {pageTitle}
          </h1>
          <p className="text-sm text-slate-500 hidden sm:block">
            {isAdmin && `Welcome back, ${user?.name || 'Prathamesh Deshmukh'}. Manage your operations today.`}
            {isTechnician && `Active field schedule • Pune City Zone`}
            {isCustomer && `Welcome back, book and track verified doorstep services.`}
          </p>
        </div>
      </div>

      {/* Middle: Universal Search Bar matching theme */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-2 w-full focus-within:ring-2 focus-within:ring-purple-100 transition">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings, technicians, customers..."
            className="text-sm bg-transparent outline-none w-full text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right: Quick Action, Role Switcher, Notification & Profile */}
      <div className="flex items-center gap-3">
        {/* Book Service Quick Action Button */}
        <button
          onClick={onOpenNewBookingModal}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white rounded-xl text-sm font-medium shadow-sm transition active:scale-95"
        >
          <Sparkles className="w-4 h-4" />
          <span>Book Service</span>
        </button>

        {/* Interview Demo Role Switcher Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition"
          >
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
            <span className="capitalize">{user?.role.toLowerCase()}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Switch Role (Demo)
                </span>
              </div>
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => handleSwitchRole('ADMIN')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isAdmin ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600" />
                    <span>Admin (Operations)</span>
                  </div>
                  {isAdmin && <Check className="w-3.5 h-3.5 text-purple-600" />}
                </button>
                <button
                  onClick={() => handleSwitchRole('TECHNICIAN')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isTechnician ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Technician (Rahul S.)</span>
                  </div>
                  {isTechnician && <Check className="w-3.5 h-3.5 text-purple-600" />}
                </button>
                <button
                  onClick={() => handleSwitchRole('CUSTOMER')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                    isCustomer ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Customer (Siddhant P.)</span>
                  </div>
                  {isCustomer && <Check className="w-3.5 h-3.5 text-purple-600" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center relative hover:bg-slate-50 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50">
              <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">Live Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => markAsRead(notif._id)}
                      className={`p-2.5 rounded-xl cursor-pointer text-left transition ${
                        notif.isRead ? 'bg-slate-50/70 hover:bg-slate-100' : 'bg-purple-50/70 hover:bg-purple-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pr-2 bg-white rounded-full border border-slate-200/90 shadow-2xs hover:border-slate-300 transition"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || (isAdmin ? 'Prathamesh Deshmukh' : 'User')}
              className="w-7 h-7 rounded-full object-cover border border-purple-200"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-semibold text-slate-800 hidden md:block max-w-[100px] truncate">
              {user?.name ? user.name.split(' ')[0] : (isAdmin ? 'Prathamesh' : 'User')}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || (isAdmin ? 'Prathamesh Deshmukh' : 'User')}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                  {user?.role}
                </span>
              </div>

              <div className="mt-1 space-y-0.5">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
