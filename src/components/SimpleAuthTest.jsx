import React, { useState } from 'react';
import { apiService, endpoints } from '../services/api';
import Button from './Button';
import Card from './Card';

const SimpleAuthTest = () => {
  const [results, setResults] = useState([]);

  const addResult = (test, success, data) => {
    setResults(prev => [...prev, {
      test,
      success,
      data: JSON.stringify(data, null, 2),
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testEndpoint = async (url, data, description) => {
    try {
      console.log(`Testing ${description}:`, { url, data });
      const response = await apiService.post(url, data);
      console.log(`Success for ${description}:`, response.data);
      addResult(description, true, response.data);
      return response;
    } catch (error) {
      console.log(`Error for ${description}:`, error);
      const errorInfo = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        requestData: error.config?.data
      };
      addResult(description, false, errorInfo);
      return null;
    }
  };

  const runTests = async () => {
    setResults([]);

    // Test basic login formats
    await testEndpoint(endpoints.login, { username: 'admin', password: 'admin' }, 'Login with admin/admin');
    await testEndpoint(endpoints.login, { username: 'user', password: 'password' }, 'Login with user/password');
    await testEndpoint(endpoints.login, { username: 'testuser', password: 'test123' }, 'Login with testuser/test123');
    
    // Test registration
    await testEndpoint(endpoints.register, { 
      username: 'testuser', 
      email: 'test@example.com', 
      password: 'password123' 
    }, 'Register with username/email/password');

    // Test minimal formats
    await testEndpoint(endpoints.login, { username: 'test' }, 'Login with username only');
    await testEndpoint(endpoints.login, { password: 'test' }, 'Login with password only');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Simple Authentication Test</h2>
        <p className="text-gray-600 mb-4">
          This tests different authentication formats to identify what your Django backend expects.
        </p>
        <Button onClick={runTests} className="mb-4">
          Run Authentication Tests
        </Button>
        <Button onClick={() => setResults([])} variant="outline" className="ml-2">
          Clear Results
        </Button>
      </div>

      {results.length > 0 && (
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
              
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                {result.data}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleAuthTest;
