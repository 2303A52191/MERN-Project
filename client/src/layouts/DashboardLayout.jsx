import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  FolderKanban,
  Users2,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Team Hub', path: '/team', icon: Users2 },
  ];

  return (
    <div className="flex h-screen premium-dark-bg text-slate-100 transition-colors duration-200">
      
      {/* 1. Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* 2. Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 lg:static lg:flex lg:flex-col transform transition-transform duration-300 ease-in-out border-r border-slate-800 bg-slate-950/40 backdrop-blur-md ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand/Logo Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-brand-500 text-white shadow-neon-indigo">
              <span className="text-xl font-bold tracking-tight">T</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800 dark:text-white">
              TaskFlow <span className="text-primary-500 dark:text-indigo-400">AI</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-extrabold tracking-wide transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-500/10 to-brand-500/10 dark:from-indigo-600/35 dark:to-brand-600/35 text-white border-l-4 border-indigo-500'
                    : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout inside Sidebar Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/10">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
              alt={user?.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-500/20"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-slate-800 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-200 truncate uppercase font-bold tracking-wider">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl border border-slate-700 text-sm font-extrabold text-rose-500 dark:text-rose-400 hover:bg-rose-950/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* 3. Main Workspace Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="flex items-center justify-between h-20 px-6 border-b border-slate-800 bg-slate-950/30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-800 lg:hidden text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="hidden md:block text-sm font-bold text-slate-400 dark:text-slate-200 tracking-wider">
              {location.pathname === '/'
                ? 'PLATFORM METRICS'
                : location.pathname.substring(1).toUpperCase() + ' WORKSPACE'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Profile Dropdown Placeholder (Visual Only) */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900">
              <span className="hidden sm:inline text-sm font-extrabold text-white">
                {user?.name.split(' ')[0]}
              </span>
              <img
                src={user?.avatar}
                alt="user avatar"
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary-500/20"
              />
            </div>
          </div>
        </header>

        {/* Content Body Pane */}
        <main className="flex-grow overflow-y-auto p-6 md:p-8 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
