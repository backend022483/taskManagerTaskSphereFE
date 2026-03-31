import React, { useState } from 'react';
import { apiService, endpoints } from '../services/api';
import Button from './Button';
import Card from './Card';

const LoginDebugPage = () => {
  const [username, setUsername] = useState('testlogin');
  const [password, setPassword] = useState('testlogin123');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check current auth state
  React.useEffect(() => {
    console.log('Current auth state:', {
      token: localStorage.getItem('authToken'),
      user: localStorage.getItem('user'),
      isAuthenticated: !!localStorage.getItem('authToken')
    });
  }, []);

  const addResult = (test, success, data, error = null) => {
    setResults(prev => [...prev, {
      test,
      success,
      data: JSON.stringify(data, null, 2),
      error: error ? JSON.stringify(error, null, 2) : null,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testLogin = async (testName, credentials) => {
    try {
      console.log(`Testing ${testName} with:`, credentials);
      
      const response = await apiService.post(endpoints.login, credentials);
      
      console.log(`Success for ${testName}:`, response.data);
      
      addResult(testName, true, response.data);
      
      // If successful, store token and show info
      if (response.data.token) {
        console.log('Storing token:', response.data.token);
        console.log('Token type:', typeof response.data.token);
        console.log('Token length:', response.data.token.length);
        
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Verify it was stored
        const storedToken = localStorage.getItem('authToken');
        console.log('Token after storage:', storedToken);
        
        // Immediate re-check
        setTimeout(() => {
          const recheckedToken = localStorage.getItem('authToken');
          console.log('Token after timeout:', recheckedToken);
        }, 100);
        
        // Show success message
        alert('Login successful! Token stored. You can now access the main app.');
        
        // Don't auto-reload, let user see results
      } else {
        console.log('No token in response:', response.data);
        addResult(testName + ' - No Token', false, response.data, {
          message: 'Login response contained no token'
        });
      }
    } catch (error) {
      console.error(`Error for ${testName}:`, error);
      addResult(testName, false, null, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
  };

  const testDirectFetch = async (testName, credentials) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.reload();
      }
      
      addResult(testName, response.ok, {
        status: response.status,
        statusText: response.statusText,
        data: data
      }, response.ok ? null : data);
    } catch (error) {
      addResult(testName, false, null, {
        message: error.message,
        stack: error.stack
      });
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);

    // Only test working credentials to avoid errors
    const testCases = [
      { name: 'API Service - testlogin (WORKING)', credentials: { username: 'testlogin', password: 'testlogin123' } },
      { name: 'Direct Fetch - testlogin (WORKING)', credentials: { username: 'testlogin', password: 'testlogin123' } },
    ];

    for (const testCase of testCases) {
      if (testCase.name.includes('Direct Fetch')) {
        await testDirectFetch(testCase.name, testCase.credentials);
      } else {
        await testLogin(testCase.name, testCase.credentials);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setLoading(false);
  };

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    addResult('Auth Check', !!token, {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : null,
      hasUser: !!user,
      userData: user ? JSON.parse(user) : null,
      isAuthenticated: !!token
    });
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    addResult('Auth Cleared', true, { message: 'Authentication cleared from localStorage' });
  };

  const testMainApp = () => {
    // Check if we have auth data
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    console.log('testMainApp check:', { token: !!token, hasUser: !!user, tokenValue: token });
    
    if (token && user) {
      // Add a small delay to ensure auth state is properly set
      setTimeout(() => {
        // Go to main app without debug parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('debug');
        console.log('Navigating to:', url.toString());
        window.location.href = url.toString();
      }, 100);
    } else {
      alert('No authentication data found. Please login first.');
    }
  };

  const testMainAppDirect = () => {
    // Get current auth data immediately
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    console.log('Direct test - current auth:', { hasToken: !!token, hasUser: !!user });
    
    if (token && user) {
      // Store in sessionStorage as backup
      sessionStorage.setItem('backupToken', token);
      sessionStorage.setItem('backupUser', user);
      
      // Navigate with token in URL as fallback
      const url = new URL('http://localhost:3000');
      url.searchParams.delete('debug');
      window.location.href = url.toString();
    } else {
      alert('No authentication data found. Please login first.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login Debug Page</h1>
          <p className="text-gray-600">
            This page bypasses authentication to test login functionality directly.
          </p>
        </div>

        <Card className="mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Test</h2>
            <div className="flex space-x-2">
              <Button onClick={runAllTests} disabled={loading}>
                {loading ? 'Running Tests...' : 'Run All Login Tests'}
              </Button>
              <Button onClick={checkAuth} variant="outline">
                Check Auth State
              </Button>
              <Button onClick={clearAuth} variant="outline">
                Clear Auth
              </Button>
              <Button onClick={testMainApp} variant="outline">
                Test Main App
              </Button>
              <Button onClick={testMainAppDirect} variant="outline">
                Direct Main App
              </Button>
              <Button onClick={() => setResults([])} variant="outline">
                Clear Results
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Manual Test</h2>
            <form onSubmit={(e) => { e.preventDefault(); testLogin('Manual API Test', { username, password }); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button type="submit">
                  Test with API Service
                </Button>
                <Button type="button" onClick={() => testDirectFetch('Manual Fetch Test', { username, password })} variant="outline">
                  Test with Direct Fetch
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {results.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={`font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.test}
                    </h3>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  
                  <div className={`text-sm mb-2 font-medium ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.success ? '✓ SUCCESS' : '✗ FAILED'}
                  </div>
                  
                  {result.data && (
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Response Data:</p>
                      <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-48">
                        {result.data}
                      </pre>
                    </div>
                  )}
                  
                  {result.error && (
                    <div>
                      <p className="text-xs font-medium text-red-700 mb-1">Error Details:</p>
                      <pre className="bg-red-100 p-2 rounded text-xs overflow-auto max-h-48">
                        {result.error}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LoginDebugPage;
