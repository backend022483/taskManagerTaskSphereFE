import React, { useState } from 'react';
import { apiService, endpoints } from '../services/api';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import Loading from './Loading';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { username: formData.username, password: formData.password });

      const response = await apiService.post(endpoints.login, {
        username: formData.username,
        password: formData.password,
      });

      console.log('Login successful:', response.data);

      if (response.data.token) {
        // Store the token in both localStorage and sessionStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        sessionStorage.setItem('backupToken', response.data.token);
        sessionStorage.setItem('backupUser', JSON.stringify(response.data.user));

        console.log('Token stored successfully');

        // Call the onLogin callback
        onLogin(response.data);
        return;
      } else {
        setError('Login failed: No token received');
      }
    } catch (err) {
      console.error('Login failed:', err);

      let errorMessage = 'Login failed. Please check your credentials.';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        } else if (err.response.data.username) {
          errorMessage = err.response.data.username[0];
        } else if (err.response.data.password) {
          errorMessage = err.response.data.password[0];
        } else {
          // Show all validation errors
          const errors = Object.entries(err.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = `Validation errors: ${errors}`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-8 w-8 flex items-center justify-center rounded-lg bg-blue-600 shadow">
            <div className="h-2 w-2 bg-white rounded-sm"></div>
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome back
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to TaskSphere to continue
          </p>
        </div>

        {/* Card */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>

            <Input
              label="Username or Email"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username or email"
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-all duration-200 shadow-md disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
