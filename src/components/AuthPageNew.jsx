import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, User, Mail, Lock, ArrowRight, LogIn, UserPlus, CheckCircle, X } from 'lucide-react';

const AuthPageNew = () => {
  const { login, user, isAuthenticated } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const toggleMode = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
    setIsLoginMode(!isLoginMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const url = isLoginMode
        ? 'http://127.0.0.1:8000/auth/login/'
        : 'http://127.0.0.1:8000/auth/register/';

      const payload = isLoginMode
        ? {
            username: formData.username,
            password: formData.password,
          }
        : {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            confirm_password: formData.confirmPassword,
          };

      console.log('Attempting to connect to:', url);
      console.log('Payload:', payload);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok && data.token) {
        login(data);
        setSuccess('Success! Redirecting...');

        setTimeout(() => {
          window.location.href = '/';
        }, 800);
      } else {
        const errorMessage = data.username || data.email || data.password || data.detail || data.non_field_errors || 'Authentication failed';
        setError(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
      }
    } catch (err) {
      console.error('Network error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to server. Please ensure the backend is running at http://127.0.0.1:8000');
      } else {
        setError(`Network error: ${err.message}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Already logged in view
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-600 mb-6 font-medium">{user.username || user.email}</p>

          <button
            onClick={() => (window.location.href = '/')}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
          >
            <ArrowRight className="w-5 h-5" />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-8">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 w-full max-w-6xl">
          
          {/* Left Column - Branding */}
          <div className="flex-1 max-w-md text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TaskSphere
              </h1>
            </div>
            <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed font-medium">
              {isLoginMode
                ? 'Connect with your tasks and manage your productivity with TaskSphere.'
                : 'Join TaskSphere to manage your tasks and boost your productivity.'}
            </p>
          </div>

          {/* Right Column - Authentication Card */}
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  isLoginMode 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                    : 'bg-gradient-to-br from-green-500 to-emerald-600'
                }`}>
                  {isLoginMode ? (
                    <LogIn className="w-6 h-6 text-white" />
                  ) : (
                    <UserPlus className="w-6 h-6 text-white" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isLoginMode ? 'Log In' : 'Sign Up'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="username"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {!isLoginMode && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {!isLoginMode && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                    <X className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
                    <CheckCircle className="w-4 h-4" />
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span>{isLoginMode ? 'Logging in...' : 'Creating account...'}</span>
                    </>
                  ) : (
                    <>
                      {isLoginMode ? (
                        <>
                          <LogIn className="w-5 h-5" />
                          Log In
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Sign Up
                        </>
                      )}
                    </>
                  )}
                </button>
              </form>

              <div className="border-t border-gray-200 mt-6 pt-6">
                <p className="text-center text-gray-600 font-medium">
                  {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    onClick={toggleMode}
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1 mx-auto"
                  >
                    {isLoginMode ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Sign up
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Log in
                      </>
                    )}
                  </button>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
  );
};

export default AuthPageNew;
