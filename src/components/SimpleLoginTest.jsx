import React, { useState } from 'react';
import { apiService, endpoints } from '../services/api';
import Button from './Button';
import Card from './Card';

const SimpleLoginTest = () => {
  const [username, setUsername] = useState('testlogin');
  const [password, setPassword] = useState('testlogin123');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Attempting login with:', { username, password });
      
      const response = await apiService.post(endpoints.login, {
        username,
        password
      });
      
      console.log('Login successful:', response.data);
      
      setResult({
        success: true,
        data: response.data,
        message: 'Login successful!'
      });
      
      // Store token manually
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
    } catch (error) {
      console.error('Login failed:', error);
      
      setResult({
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      setResult({
        success: response.ok,
        data: data,
        status: response.status,
        statusText: response.statusText
      });
      
    } catch (error) {
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Simple Login Test</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={testLogin} disabled={loading}>
              {loading ? 'Testing...' : 'Test with API Service'}
            </Button>
            <Button onClick={testDirectAPI} variant="outline" disabled={loading}>
              {loading ? 'Testing...' : 'Test with Direct Fetch'}
            </Button>
          </div>
        </div>

        {result && (
          <div className={`border rounded-lg p-4 ${
            result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <h3 className={`font-medium mb-2 ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? '✓ SUCCESS' : '✗ FAILED'}
            </h3>
            
            {result.success && result.data && (
              <div>
                <p className="text-sm text-green-700 mb-2">{result.message}</p>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
            
            {!result.success && (
              <div>
                <p className="text-sm text-red-700 mb-2">Error Details:</p>
                <div className="text-sm space-y-1">
                  {result.status && <p><strong>Status:</strong> {result.status} {result.statusText}</p>}
                  {result.error && (
                    <pre className="bg-red-100 p-2 rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleLoginTest;
