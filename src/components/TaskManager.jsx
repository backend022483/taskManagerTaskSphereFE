import React, { useState, useEffect } from 'react';
import { apiService, endpoints } from '../services/api';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import Loading from './Loading';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo'
  });

  // Task status options
  const taskStatuses = [
    { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' }
  ];

  // Load tasks on component mount
  useEffect(() => {
    console.log('TaskManager - Component mounted, current tasks:', tasks);
    console.log('TaskManager - Initial formData:', formData);
    // Add a small delay to ensure authentication is ready
    const timer = setTimeout(() => {
      fetchTasks();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    // Check if we have a token before making the request
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
    if (!token) {
      console.log('TaskManager - No token found, skipping API call');
      setError('Authentication required. Please login again.');
      setLoading(false);
      return;
    }
    
    try {
      // Use raw fetch to bypass axios interceptor issues
      const fetchResponse = await fetch('http://127.0.0.1:8000/api/tasks/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const responseData = await fetchResponse.json();
      
      console.log('Tasks fetched:', responseData);
      console.log('Tasks fetched - full response:', responseData);
      const tasksData = responseData.results || responseData || [];
      console.log('Tasks data to set:', tasksData);
      setTasks(tasksData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tasks');
      // Set empty array on error to prevent error objects from being displayed as tasks
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    console.log('Resetting form, current formData:', formData);
    setFormData({
      title: '',
      description: '',
      status: 'todo'
    });
    setEditingTask(null);
    setShowCreateForm(false);
    console.log('Form reset completed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with formData:', formData);
    console.log('Title:', formData.title);
    console.log('Description:', formData.description);
    console.log('Status:', formData.status);
    
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError(null);

    // Check if we have a token before making the request
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
    if (!token) {
      console.log('TaskManager - No token found for task creation');
      setError('Authentication required. Please login again.');
      setLoading(false);
      return;
    }

    console.log('TaskManager - Creating task with token:', token.substring(0, 20) + '...');

    try {
      if (editingTask) {
        // Update existing task
        const response = await apiService.put(endpoints.taskById(editingTask.id), {
          title: formData.title,
          description: formData.description,
          status: formData.status
        });
        console.log('Task updated:', response.data);
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? response.data : task
        ));
      } else {
        // Create new task
        console.log('TaskManager - About to create task, checking token one more time...');
        const currentToken = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
        console.log('TaskManager - Current token before API call:', currentToken ? currentToken.substring(0, 20) + '...' : 'NONE');
        
        // Add a small delay to ensure token is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Test if token is valid by making a simple API call first
        if (currentToken) {
          console.log('TaskManager - Testing token validity...');
          try {
            const testResponse = await apiService.get('/api/');
            console.log('TaskManager - Token test successful:', testResponse.status);
          } catch (testErr) {
            console.log('TaskManager - Token test failed:', testErr.response?.status);
          }
        }
        
        let response;
        try {
          // Use raw fetch to bypass axios interceptor issues completely
          const fetchResponse = await fetch('http://127.0.0.1:8000/api/tasks/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
              title: formData.title,
              description: formData.description,
              status: formData.status
            })
          });
          
          const responseData = await fetchResponse.json();
          
          // Convert fetch response to axios-like format
          response = {
            data: responseData,
            status: fetchResponse.status,
            statusText: fetchResponse.statusText
          };
          
          console.log('Raw fetch task creation successful:', response);
        } catch (fetchErr) {
          console.log('Raw fetch failed, trying axios fallback:', fetchErr);
          
          // Final fallback to axios
          response = await apiService.post(endpoints.tasks, {
            title: formData.title,
            description: formData.description,
            status: formData.status
          });
        }
        console.log('Task created:', response.data);
        console.log('Task created - full response:', response);
        console.log('Current tasks before adding:', tasks);
        
        // Handle empty response from backend
        let newTask = response.data;
        if (!newTask || Object.keys(newTask).length === 0) {
          // Create a temporary task object from form data
          newTask = {
            id: Date.now(), // Temporary ID
            title: formData.title || 'Untitled Task',
            description: formData.description || '',
            status: formData.status || 'todo',
            created_at: new Date().toISOString()
          };
          console.log('Using temporary task object:', newTask);
          console.log('Form data used:', formData);
        }
        
        // Add the new task to the list immediately
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        console.log('Tasks after adding:', updatedTasks);
        
        // Also refresh from server to ensure consistency
        setTimeout(() => {
          console.log('TaskManager - Refreshing tasks from server...');
          fetchTasks();
        }, 500);
      }
      
      resetForm();
    } catch (err) {
      console.error('Error saving task:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error config:', err.config);
      console.error('Error status:', err.response?.status);
      
      setError(err.response?.data?.message || err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo'
    });
    setEditingTask(task);
    setShowCreateForm(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.delete(endpoints.taskById(taskId));
      console.log('Task deleted:', taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.patch(endpoints.taskById(task.id), {
        status: newStatus
      });
      console.log('Task status updated:', response.data);
      setTasks(tasks.map(t => 
        t.id === task.id ? { ...t, status: newStatus } : t
      ));
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update task status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    return taskStatuses.find(s => s.value === status) || taskStatuses[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
        >
          Create New Task
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Create/Edit Task Form */}
      {showCreateForm && (
        <Card title={editingTask ? 'Edit Task' : 'Create New Task'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Task Title"
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              required
              disabled={loading}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description (optional)"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                name="status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                disabled={loading}
              >
                {taskStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? <Loading size="sm" text="" /> : (editingTask ? 'Update Task' : 'Create Task')}
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tasks List */}
      <Card title="Tasks">
        {loading && tasks.length === 0 ? (
          <Loading />
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tasks found. Create your first task!</p>
            {console.log('Rendering: No tasks found, tasks state:', tasks)}
          </div>
        ) : (
          <div className="space-y-3">
            {console.log('Rendering tasks:', tasks, 'Length:', tasks.length)}
            {tasks.map(task => {
              console.log('Rendering individual task:', task);
              console.log('Task title:', task.title);
              console.log('Task description:', task.description);
              console.log('Task status:', task.status);
              
              const statusInfo = getStatusInfo(task.status);
              return (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {task.title || 'No Title'}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {task.created_at && (
                          <span className="text-xs text-gray-500">
                            Created: {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {/* Status Change Buttons */}
                      <select
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        disabled={loading}
                      >
                        {taskStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      
                      {/* Edit Button */}
                      <Button
                        onClick={() => handleEdit(task)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      
                      {/* Delete Button */}
                      <Button
                        onClick={() => handleDelete(task.id)}
                        variant="danger"
                        size="sm"
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Refresh Button */}
      <div className="text-center">
        <Button
          onClick={fetchTasks}
          variant="outline"
          disabled={loading}
        >
          {loading ? <Loading size="sm" text="" /> : 'Refresh Tasks'}
        </Button>
      </div>
    </div>
  );
};

export default TaskManager;
