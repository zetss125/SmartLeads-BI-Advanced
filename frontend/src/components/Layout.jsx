import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings as SettingsIcon, LogOut, MessageSquare } from 'lucide-react';
import ChatbotPanel from './ChatbotPanel';

export default function Layout({ children }) {
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/leads', label: 'Leads', icon: Users },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col transition-colors z-10">
        <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">SmartLeads BI</span>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50">
            <LogOut className="h-5 w-5 text-slate-400" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {children}
        
        {/* Floating Chat Button */}
        <button
          onClick={() => setChatOpen(true)}
          className={`fixed bottom-6 right-6 p-4 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all z-40 ${chatOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        >
          <MessageSquare className="h-6 w-6" />
        </button>
        
        <ChatbotPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      </main>
    </div>
  );
}
