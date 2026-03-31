import React, { useState } from 'react';
import { apiService, endpoints } from '../services/api';
import Button from './Button';
import Card from './Card';

const Error400Diagnostic = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, data) => {
    setResults(prev => [...prev, {
      test,
      success,
      data: JSON.stringify(data, null, 2),
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testAuthFormat = async (url, data, description) => {
    try {
      // Log the exact request being made
      console.log(`Testing: ${description}`);
      console.log('URL:', url);
      console.log('Data:', data);
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || 'none'}`
      });

      const response = await apiService.post(url, data);
      console.log(`Success: ${description}`, response.data);
      addResult(description, true, response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.log(`Error: ${description}`, error);
      
      // Extract detailed error information
      const errorInfo = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        }
      };
      
      addResult(description, false, errorInfo);
      return { success: false, error: errorInfo };
    }
  };

  const runComprehensiveTest = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Standard Django auth formats
    await testAuthFormat(endpoints.login, 
      { username: 'admin', password: 'admin' }, 
      'Django Standard: username/password'
    );

    await testAuthFormat(endpoints.login, 
      { email: 'admin@example.com', password: 'admin' }, 
      'Django Email: email/password'
    );

    // Test 2: DRF (Django Rest Framework) formats
    await testAuthFormat(endpoints.login, 
      { username: 'admin', password: 'admin' }, 
      'DRF Standard: username/password'
    );

    await testAuthFormat(endpoints.login, 
      { email: 'admin@example.com', password: 'admin' }, 
      'DRF Email: email/password'
    );

    // Test 3: Custom field names
    await testAuthFormat(endpoints.login, 
      { user: 'admin', password: 'admin' }, 
      'Custom: user/password'
    );

    await testAuthFormat(endpoints.login, 
      { login: 'admin', password: 'admin' }, 
      'Custom: login/password'
    );

    // Test 4: JWT token formats
    await testAuthFormat(endpoints.login, 
      { username: 'admin', password: 'admin' }, 
      'JWT Format: username/password'
    );

    // Test 5: Registration formats
    await testAuthFormat(endpoints.register, 
      { 
        username: 'testuser', 
        email: 'test@example.com', 
        password: 'password123',
        password2: 'password123'  // Django often requires password confirmation
      }, 
      'Register with password confirmation'
    );

    await testAuthFormat(endpoints.register, 
      { 
        username: 'testuser', 
        email: 'test@example.com', 
        password: 'password123'
      }, 
      'Register without password confirmation'
    );

    // Test 6: Check if endpoints exist
    await testAuthFormat('/api/token/', 
      { username: 'admin', password: 'admin' }, 
      'DRF Token Endpoint: /api/token/'
    );

    await testAuthFormat('/api/auth/login/', 
      { username: 'admin', password: 'admin' }, 
      'Alternative: /api/auth/login/'
    );

    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">400 Error Diagnostic Tool</h2>
        <p className="text-gray-600 mb-4">
          This tool tests multiple authentication formats to identify exactly what your Django backend expects.
          Check the browser console (F12) for detailed request logs.
        </p>
        
        <div className="flex space-x-2">
          <Button onClick={runComprehensiveTest} disabled={loading}>
            {loading ? 'Running Tests...' : 'Run Comprehensive Test'}
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Test Results:</h3>
          {results.map((result, index) => (
            <div key={index} className={`border rounded-lg p-4 ${
              result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <h4 className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.test}
                </h4>
                <span className="text-xs text-gray-500">{result.timestamp}</span>
              </div>
              
              <div className={`text-sm mb-2 font-medium ${
                result.success ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.success ? '✓ SUCCESS - This format works!' : '✗ FAILED'}
              </div>
              
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64 whitespace-pre-wrap">
                {result.data}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">🔍 How to Fix 400 Errors:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Look for any <strong>SUCCESS</strong> results above - those show the correct format</li>
          <li>• Check error details for <strong>"required field"</strong> messages</li>
          <li>• Look for <strong>CSRF</strong> or <strong>token</strong> related errors</li>
          <li>• Check browser console (F12) for detailed request logs</li>
          <li>• Once you find a working format, I'll update the login forms</li>
        </ul>
      </div>
    </div>
  );
};

export default Error400Diagnostic;
