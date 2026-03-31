import React, { useState } from 'react';
import { apiService, endpoints } from '../services/api';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import Loading from './Loading';

const AuthDebugger = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, data, error = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      data: JSON.stringify(data, null, 2),
      error: error ? JSON.stringify(error, null, 2) : null,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testLogin = async (username, password) => {
    try {
      console.log('Testing login with:', { username, password });
      const response = await apiService.post(endpoints.login, { username, password });
      console.log('Login success:', response.data);
      addResult(`Login: ${username}/${password}`, true, response.data);
      return response;
    } catch (error) {
      console.log('Login error:', error);
      const errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      };
      addResult(`Login: ${username}/${password}`, false, null, errorDetails);
      return null;
    }
  };

  const testRegister = async (username, email, password) => {
    try {
      console.log('Testing register with:', { username, email, password });
      const response = await apiService.post(endpoints.register, { username, email, password });
      console.log('Register success:', response.data);
      addResult(`Register: ${username}/${email}`, true, response.data);
      return response;
    } catch (error) {
      console.log('Register error:', error);
      const errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      };
      addResult(`Register: ${username}/${email}`, false, null, errorDetails);
      return null;
    }
  };

  const testCommonCredentials = async () => {
    setLoading(true);
    setTestResults([]);
    
    // Test different field combinations for login
    await testLoginFormat('username', 'admin', 'admin');
    await testLoginFormat('username', 'user', 'password');
    await testLoginFormat('username', 'test', 'test');
    await testLoginFormat('username', 'demo', 'demo');
    
    // Test with email field instead of username
    await testLoginFormat('email', 'admin@example.com', 'admin');
    await testLoginFormat('email', 'user@example.com', 'password');
    await testLoginFormat('email', 'test@example.com', 'test');
    
    // Test different field names
    await testLoginFormat('user', 'admin', 'admin');
    await testLoginFormat('user', 'user', 'password');
    
    // Test registration with different formats
    await testRegisterFormat('admin', 'admin@example.com', 'password123');
    await testRegisterFormat('testuser', 'test@example.com', 'password123');
    
    setLoading(false);
  };

  const testLoginFormat = async (field, identifier, password) => {
    try {
      const data = field === 'email' ? { email: identifier, password } : { [field]: identifier, password };
      console.log(`Testing login with ${field}:`, data);
      const response = await apiService.post(endpoints.login, data);
      console.log('Login success:', response.data);
      addResult(`Login (${field}): ${identifier}/${password}`, true, response.data);
      return response;
    } catch (error) {
      console.log(`Login error with ${field}:`, error);
      const errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      };
      addResult(`Login (${field}): ${identifier}/${password}`, false, null, errorDetails);
      return null;
    }
  };

  const testRegisterFormat = async (username, email, password) => {
    try {
      const data = { username, email, password };
      console.log('Testing register with:', data);
      const response = await apiService.post(endpoints.register, data);
      console.log('Register success:', response.data);
      addResult(`Register: ${username}/${email}`, true, response.data);
      return response;
    } catch (error) {
      console.log('Register error:', error);
      const errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      };
      addResult(`Register: ${username}/${email}`, false, null, errorDetails);
      return null;
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Debugger</h1>
        
        <Card title="Test Authentication">
          <div className="space-y-4">
            <p className="text-gray-600">
              This tool tests various credential combinations against your authentication endpoints 
              to help identify what works.
            </p>
            
            <div className="flex space-x-4">
              <Button
                onClick={testCommonCredentials}
                disabled={loading}
                className="flex-1"
              >
                {loading ? <Loading size="sm" text="" /> : 'Test Common Credentials'}
              </Button>
              
              <Button
                onClick={clearResults}
                variant="outline"
                disabled={loading}
              >
                Clear Results
              </Button>
            </div>
          </div>
        </Card>

        {testResults.length > 0 && (
          <Card title="Test Results" className="mt-6">
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {result.test}
                    </h4>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  
                  <div className="text-sm">
                    <div className={`font-medium mb-1 ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.success ? '✓ Success' : '✗ Failed'}
                    </div>
                    
                    {result.data && (
                      <div className="mt-2">
                        <strong className="text-gray-700">Response:</strong>
                        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto mt-1">
                          {result.data}
                        </pre>
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="mt-2">
                        <strong className="text-gray-700">Error:</strong>
                        <pre className="bg-red-100 p-2 rounded text-xs overflow-auto mt-1">
                          {result.error}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card title="Manual Test" className="mt-6">
          <ManualTest onResult={addResult} />
        </Card>
      </div>
    </div>
  );
};

const ManualTest = ({ onResult }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await apiService.post(endpoints.login, {
        username: credentials.username,
        password: credentials.password
      });
      onResult(`Manual Login: ${credentials.username}`, true, response.data);
    } catch (error) {
      onResult(`Manual Login: ${credentials.username}`, false, null, error.response?.data || error.message);
    }
    setLoading(false);
  };

  const testRegister = async () => {
    setLoading(true);
    try {
      const response = await apiService.post(endpoints.register, {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password
      });
      onResult(`Manual Register: ${credentials.username}`, true, response.data);
    } catch (error) {
      onResult(`Manual Register: ${credentials.username}`, false, null, error.response?.data || error.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Username"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          placeholder="Enter username"
        />
        <Input
          label="Email (for register)"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          placeholder="Enter email"
        />
        <Input
          label="Password"
          name="password"
          type="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Enter password"
        />
      </div>
      
      <div className="flex space-x-4">
        <Button
          onClick={testLogin}
          disabled={loading || !credentials.username || !credentials.password}
        >
          {loading ? <Loading size="sm" text="" /> : 'Test Login'}
        </Button>
        <Button
          onClick={testRegister}
          variant="outline"
          disabled={loading || !credentials.username || !credentials.email || !credentials.password}
        >
          {loading ? <Loading size="sm" text="" /> : 'Test Register'}
        </Button>
      </div>
    </div>
  );
};

export default AuthDebugger;
