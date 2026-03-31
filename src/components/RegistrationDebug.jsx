import React, { useState } from 'react';
import { apiService, endpoints } from '../services/api';
import Button from './Button';
import Input from './Input';
import Card from './Card';

const RegistrationDebug = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setResult(null);

    const testData = {
      username: 'debuguser' + Date.now(),
      email: `debuguser${Date.now()}@example.com`,
      password: 'password123',
      confirm_password: 'password123'
    };

    try {
      console.log('Testing registration with:', testData);
      const response = await apiService.post(endpoints.register, testData);
      console.log('Registration successful:', response.data);
      setResult({
        success: true,
        data: response.data,
        message: 'Registration successful!'
      });
    } catch (error) {
      console.error('Registration failed:', error);
      setResult({
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
        message: 'Registration failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Registration Debug Tool">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          This tool tests the registration endpoint directly to help diagnose issues.
        </p>
        
        <Button
          onClick={testRegistration}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test Registration'}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h4 className={`font-medium mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </h4>
            
            {result.success ? (
              <div className="text-sm text-green-700">
                <p><strong>User ID:</strong> {result.data.user?.id}</p>
                <p><strong>Username:</strong> {result.data.user?.username}</p>
                <p><strong>Email:</strong> {result.data.user?.email}</p>
                <p><strong>Token:</strong> {result.data.token?.substring(0, 20)}...</p>
              </div>
            ) : (
              <div className="text-sm text-red-700">
                <p><strong>Status:</strong> {result.status}</p>
                <p><strong>Error Details:</strong></p>
                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RegistrationDebug;
