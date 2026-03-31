import React, { useState } from 'react';
import { apiService, endpoints } from '../services/api';
import Button from './Button';
import Card from './Card';

const DirectLoginTest = () => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, success, data, error = null) => {
    setResults(prev => [...prev, {
      test,
      success,
      data: JSON.stringify(data, null, 2),
      error: error ? JSON.stringify(error, null, 2) : null,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testDirectLogin = async () => {
    setIsLoading(true);
    setResults([]);

    // Test the exact same credentials that work in Django
    const testCases = [
      {
        name: 'Direct API Test - testlogin',
        data: { username: 'testlogin', password: 'testlogin123' }
      },
      {
        name: 'Direct API Test - admin',
        data: { username: 'admin', password: 'admin' }
      },
      {
        name: 'Empty Request (should fail)',
        data: {}
      }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`Testing: ${testCase.name}`, testCase.data);
        
        const response = await apiService.post(endpoints.login, testCase.data);
        
        console.log('Success response:', response);
        
        addResult(testCase.name, true, {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers
        });
        
        // If we get a successful login, we can stop
        if (response.data.token) {
          break;
        }
        
      } catch (error) {
        console.error(`Error for ${testCase.name}:`, error);
        
        addResult(testCase.name, false, null, {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
            data: error.config?.data
          }
        });
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsLoading(false);
  };

  const testRawRequest = async () => {
    try {
      // Test with fetch API to bypass axios completely
      const response = await fetch('http://127.0.0.1:8000/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'testlogin',
          password: 'testlogin123'
        })
      });
      
      const data = await response.json();
      
      addResult('Raw Fetch Test', response.ok, {
        status: response.status,
        statusText: response.statusText,
        data: data
      }, response.ok ? null : data);
    } catch (error) {
      addResult('Raw Fetch Test', false, null, {
        message: error.message,
        stack: error.stack
      });
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Direct Login Test</h2>
        <p className="text-gray-600 mb-4">
          This tests the login endpoint with the exact credentials that work in Django.
        </p>
        
        <div className="flex space-x-2">
          <Button onClick={testDirectLogin} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test Direct Login'}
          </Button>
          <Button onClick={testRawRequest} variant="outline">
            Test Raw Fetch
          </Button>
          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
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
      )}
    </div>
  );
};

export default DirectLoginTest;
