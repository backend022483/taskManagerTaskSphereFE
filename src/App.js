import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { apiService, endpoints } from './services/api';
import Button from './components/Button';
import Input from './components/Input';
import Card from './components/Card';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';
import AuthDebugger from './components/AuthDebugger';
import SimpleAuthTest from './components/SimpleAuthTest';
import Error400Diagnostic from './components/400ErrorDiagnostic';
import TaskManager from './components/TaskManager';
import LoginDiagnostic from './components/LoginDiagnostic';
import DirectLoginTest from './components/DirectLoginTest';
import SimpleLoginTest from './components/SimpleLoginTest';
import LoginDebugPage from './components/LoginDebugPage';
import './App.css';

function AppContent() {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks');
  const [customUrl, setCustomUrl] = useState('');
  const [requestData, setRequestData] = useState('');
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiCall = async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      switch (method.toLowerCase()) {
        case 'get':
          response = await apiService.get(endpoint);
          break;
        case 'post':
          response = await apiService.post(endpoint, data ? JSON.parse(data) : {});
          break;
        case 'put':
          response = await apiService.put(endpoint, data ? JSON.parse(data) : {});
          break;
        case 'delete':
          response = await apiService.delete(endpoint);
          break;
        default:
          throw new Error('Unsupported method');
      }
      setResponseData(response.data);
    } catch (err) {
      let errorMessage = 'An error occurred';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = `Server Error ${err.response.status}: ${err.response.statusText}`;
        if (err.response.data) {
          if (typeof err.response.data === 'string') {
            errorMessage += ` - ${err.response.data}`;
          } else if (err.response.data.detail) {
            errorMessage += ` - ${err.response.data.detail}`;
          } else if (err.response.data.message) {
            errorMessage += ` - ${err.response.data.message}`;
          }
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Network Error: No response from server. Is the backend running?';
      } else {
        // Something else happened
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setResponseData(null);
    } finally {
      setLoading(false);
    }
  };

  const predefinedEndpoints = [
    { name: 'Health Check', method: 'GET', endpoint: endpoints.health },
    { name: 'Get Tasks', method: 'GET', endpoint: endpoints.tasks },
    { name: 'Get Task Statuses', method: 'GET', endpoint: endpoints.taskStatuses },
    { name: 'Get Task Priorities', method: 'GET', endpoint: endpoints.taskPriorities },
    { name: 'Get Activity Logs', method: 'GET', endpoint: endpoints.activityLogs },
    { name: 'Get Notifications', method: 'GET', endpoint: endpoints.notifications },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">TaskSphere API Client</h1>
                <p className="text-gray-600">Test and interact with your API endpoints</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Welcome,</p>
                  <p className="font-medium text-gray-900">{user?.username || user?.email || 'User'}</p>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            </div>
          </header>

          <div className="mb-6">
            <div className="flex space-x-1 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'tasks'
                    ? 'bg-white border-b-2 border-green-500 text-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Task Management
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'test'
                    ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                API Testing
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'custom'
                    ? 'bg-white border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Custom Request
              </button>
              <button
                onClick={() => setActiveTab('diagnostic')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'diagnostic'
                    ? 'bg-white border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Login Diagnostic
              </button>
              <button
                onClick={() => setActiveTab('simple')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'simple'
                    ? 'bg-white border-b-2 border-purple-500 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Simple Test
              </button>
              <button
                onClick={() => setActiveTab('debug')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'debug'
                    ? 'bg-white border-b-2 border-orange-500 text-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Auth Debug
              </button>
              <button
                onClick={() => setActiveTab('400')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === '400'
                    ? 'bg-white border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                400 Diagnostic
              </button>
              <button
                onClick={() => setActiveTab('direct')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'direct'
                    ? 'bg-white border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Direct Test
              </button>
              <button
                onClick={() => setActiveTab('simple')}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'simple'
                    ? 'bg-white border-b-2 border-pink-500 text-pink-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Simple Login
              </button>
            </div>
          </div>

          {activeTab === 'tasks' && (
            <TaskManager />
          )}

          {activeTab === 'test' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Predefined Endpoints">
                <div className="space-y-3">
                  {predefinedEndpoints.map((endpoint, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">{endpoint.name}</p>
                        <p className="text-sm text-gray-500">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {endpoint.method}
                          </span>
                          <span className="ml-2 font-mono text-xs">{endpoint.endpoint}</span>
                        </p>
                      </div>
                      <Button
                        onClick={() => handleApiCall(endpoint.method, endpoint.endpoint)}
                        disabled={loading}
                        size="sm"
                      >
                        Test
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Response">
                {loading ? (
                  <Loading />
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                ) : responseData ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Response Data:</p>
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(responseData, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No response yet. Test an endpoint to see results.</p>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Custom Request">
                <Input
                  label="Endpoint URL"
                  placeholder="/api/endpoint"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Body (JSON)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder='{"key": "value"}'
                    value={requestData}
                    onChange={(e) => setRequestData(e.target.value)}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleApiCall('GET', customUrl)}
                    disabled={loading || !customUrl}
                    variant="outline"
                  >
                    GET
                  </Button>
                  <Button
                    onClick={() => handleApiCall('POST', customUrl, requestData)}
                    disabled={loading || !customUrl}
                    variant="primary"
                  >
                    POST
                  </Button>
                  <Button
                    onClick={() => handleApiCall('PUT', customUrl, requestData)}
                    disabled={loading || !customUrl}
                    variant="secondary"
                  >
                    PUT
                  </Button>
                  <Button
                    onClick={() => handleApiCall('DELETE', customUrl)}
                    disabled={loading || !customUrl}
                    variant="danger"
                  >
                    DELETE
                  </Button>
                </div>
              </Card>

              <Card title="Response">
                {loading ? (
                  <Loading />
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">Error</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                ) : responseData ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Response Data:</p>
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(responseData, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Enter an endpoint and click a method to test.</p>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'diagnostic' && (
            <Card title="Login System Diagnostic">
              <LoginDiagnostic />
            </Card>
          )}

          {activeTab === 'simple' && (
            <Card title="Authentication Format Tester">
              <SimpleAuthTest />
            </Card>
          )}

          {activeTab === 'debug' && (
            <AuthDebugger />
          )}

          {activeTab === '400' && (
            <Card title="400 Error Diagnostic">
              <Error400Diagnostic />
            </Card>
          )}

          {activeTab === 'direct' && (
            <Card title="Direct Login Test">
              <DirectLoginTest />
            </Card>
          )}

          {activeTab === 'simple' && (
            <Card title="Simple Login Test">
              <SimpleLoginTest />
            </Card>
          )}

          <Card title="API Configuration" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Base URL</p>
                <p className="font-mono text-sm text-gray-600">http://127.0.0.1:8000</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Authentication</p>
                <p className="text-sm text-gray-600">Bearer token (authenticated)</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Show debug page if ?debug=true is in URL
  if (urlParams.get('debug') === 'true') {
    return <LoginDebugPage />;
  }
  
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
