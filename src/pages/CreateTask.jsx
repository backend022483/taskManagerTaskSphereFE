import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const CreateTask = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    due_date: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const taskStatuses = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const taskPriorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      // First, preserve existing tasks
      const savedTasks = localStorage.getItem('tasks');
      const existingTasks = savedTasks ? JSON.parse(savedTasks) : [];
      
      // Create the new task locally first
      const newTask = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        status: formData.status,
        due_date: formData.due_date,
        priority: formData.priority,
        created_at: new Date().toISOString()
      };
      
      // Update local state
      const updatedTasks = [...existingTasks, newTask];
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      // Try to sync with API
      try {
        const response = await fetch('http://127.0.0.1:8000/api/tasks/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            status: formData.status,
            due_date: formData.due_date,
            priority: formData.priority
          })
        });
        
        const data = await response.json();
        console.log('API sync response:', data);
      } catch (apiError) {
        console.error('API sync error, but local state was preserved:', apiError);
      }
      
      navigate('/tasks');
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Tasks</span>
        </button>
      </div>

      <Card className="bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Task</h1>
        <p className="text-gray-600 mb-8">Fill in the details below to create a new task</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {taskStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {taskPriorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <Input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/tasks')}
              variant="secondary"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateTask;
