import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './hooks/useAuth';
import AuthPageNew from './components/AuthPageNew';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import CreateTask from './pages/CreateTask';
import EditTask from './pages/EditTask';
import TaskDetails from './pages/TaskDetails';
import ProtectedRoute from './components/ProtectedRoute';

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

  const Content = () => {
    if (!user) {
      return (
        <Routes>
          <Route path="/" element={<AuthPageNew />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">TaskSphere</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">
                  Welcome back, {user?.username || user?.email || 'User'}
                </span>
                <button
                  onClick={handleLogoutClick}
                  disabled={logoutLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {logoutLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  )}
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <svg className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Content />
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
