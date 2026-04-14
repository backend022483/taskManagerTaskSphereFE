import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Sparkles, LogOut, Loader2 } from 'lucide-react';

import { useAuth, AuthProvider } from './hooks/useAuth';

import AuthPageNew from './components/AuthPageNew';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import CreateTask from './pages/CreateTask';
import EditTask from './pages/EditTask';
import TaskDetails from './pages/TaskDetails';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogoutClick = async () => {
    setLogoutLoading(true);
    try {
      logout();
    } finally {
      setLogoutLoading(false);
    }
  };

  // 🔄 Loading state (full screen)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* ================= AUTH ROUTES ================= */}
{!user ? (
  <Routes>
    <Route path="/" element={<AuthPageNew />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
) : (
        /* ================= APP LAYOUT ================= */
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

          {/* HEADER */}
          <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">TaskSphere</h1>
                </div>

                {/* User + Logout */}
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <span className="text-gray-700 font-semibold">
                      Welcome, {user?.username || user?.email || 'User'}
                    </span>
                  </div>

                  <button
                    onClick={handleLogoutClick}
                    disabled={logoutLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md shadow-red-500/30 disabled:opacity-50 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{logoutLoading ? 'Logging out...' : 'Logout'}</span>
                  </button>
                </div>

              </div>
            </div>
          </header>

          {/* MAIN ROUTES */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<TaskList />} />
              <Route path="/tasks/create" element={<CreateTask />} />
              <Route path="/tasks/:id" element={<TaskDetails />} />
              <Route path="/tasks/:id/edit" element={<EditTask />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

        </div>
      )}
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

