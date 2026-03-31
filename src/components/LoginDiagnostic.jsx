import React, { useState } from 'react';
import { apiService, endpoints } from '../services/api';
import Button from './Button';
import Card from './Card';

const LoginDiagnostic = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, success, data, error = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      data: JSON.stringify(data, null, 2),
      error: error ? JSON.stringify(error, null, 2) : null,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testBackendConnection = async () => {
    try {
      const response = await apiService.get('/');
      addResult('Backend Connection Test', true, {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
      return true;
    } catch (error) {
      addResult('Backend Connection Test', false, null, {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      return false;
    }
  };

  const testAuthEndpoint = async () => {
    try {
      // Test if the auth endpoint exists and accepts POST requests
      const response = await apiService.post(endpoints.login, {});
      addResult('Auth Endpoint Test', true, response.data);
    } catch (error) {
      addResult('Auth Endpoint Test', false, null, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
    }
  };

  const testLoginFormats = async () => {
    const testCredentials = [
      { username: 'admin', password: 'admin' },
      { username: 'user', password: 'password' },
      { username: 'testuser', password: 'test123' },
      { username: 'abc', password: 'test123456' }, // From your error log
      { username: 'testlogin', password: 'testlogin123' }, // Known good credentials
    ];

    for (const creds of testCredentials) {
      try {
        const response = await apiService.post(endpoints.login, creds);
        addResult(`Login Test (${Object.keys(creds)[0]})`, true, {
          credentials: creds,
          response: response.data
        });
        // If successful, we can stop testing other formats
        if (response.data.token) {
          break;
        }
      } catch (error) {
        addResult(`Login Test (${Object.keys(creds)[0]})`, false, null, {
          credentials: creds,
          error: {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
          }
        });
      }
    }
  };

  const testRegistration = async () => {
    try {
      const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'testpassword123'
      };
      
      const response = await apiService.post(endpoints.register, testUser);
      addResult('Registration Test', true, {
        request: testUser,
        response: response.data
      });
    } catch (error) {
      addResult('Registration Test', false, null, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    await testBackendConnection();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testAuthEndpoint();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testLoginFormats();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testRegistration();
    
    setIsLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Login System Diagnostic</h2>
        <p className="text-gray-600 mb-4">
          This tool helps identify why login is failing by testing the backend connection,
          authentication endpoints, and different credential formats.
        </p>
        
        <div className="flex space-x-2">
          <Button onClick={runAllTests} disabled={isLoading}>
            {isLoading ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
          {testResults.map((result, index) => (
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
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
                    {result.data}
                  </pre>
                </div>
              )}
              
              {result.error && (
                <div>
                  <p className="text-xs font-medium text-red-700 mb-1">Error Details:</p>
                  <pre className="bg-red-100 p-2 rounded text-xs overflow-auto max-h-32">
                    {result.error}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!isLoading && testResults.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Click "Run All Tests" to diagnose the login system.</p>
        </div>
      )}
    </div>
  );
};

export default LoginDiagnostic;
