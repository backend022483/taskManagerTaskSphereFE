import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Plus, Settings, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Tasks', icon: ClipboardList, path: '/tasks' },
    { name: 'Create Task', icon: Plus, path: '/tasks/create' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-white to-slate-50 border-r border-gray-200/60 transition-all duration-300 shadow-xl ${collapsed ? 'w-20' : 'w-64'} z-20`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200/60 bg-gradient-to-r from-blue-600 to-indigo-600">
        {!collapsed ? (
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="font-bold text-white text-lg">TaskSphere</span>
          </div>
        ) : (
          <Sparkles className="w-6 h-6 text-white" />
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm hover:shadow-md"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
