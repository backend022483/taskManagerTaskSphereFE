import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const EditTask = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    due_date: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const loadTask = () => {
      try {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
          const tasks = JSON.parse(savedTasks);
          const task = tasks.find(t => t.id === parseInt(id));
          if (task) {
            setFormData({
              title: task.title || '',
              description: task.description || '',
              status: task.status || 'todo',
              due_date: task.due_date || '',
              priority: task.priority || 'medium'
            });
          } else {
            setError('Task not found');
          }
        }
      } catch (err) {
        console.error('Error loading task:', err);
        setError('Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [id]);

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

    setSaving(true);
    setError(null);

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
    if (!token) {
      setError('Authentication required');
      setSaving(false);
      return;
    }

    try {
      const savedTasks = localStorage.getItem('tasks');
      const tasks = savedTasks ? JSON.parse(savedTasks) : [];
      
      const taskIndex = tasks.findIndex(t => t.id === parseInt(id));
      if (taskIndex === -1) {
        setError('Task not found');
        setSaving(false);
        return;
      }
      
      // Update task locally
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        title: formData.title,
        description: formData.description,
        status: formData.status,
        due_date: formData.due_date,
        priority: formData.priority
      };
      
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      // Try to sync with API
      try {
        await fetch(`http://127.0.0.1:8000/api/tasks/${id}/`, {
          method: 'PATCH',
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
      } catch (apiError) {
        console.error('API sync error, but local state was preserved:', apiError);
      }
      
      navigate(`/tasks/${id}`);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white shadow-lg rounded-xl p-8 text-center">
          <svg className="w-4 h-4 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => navigate('/tasks')}
            variant="primary"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Tasks
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/tasks/${id}`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Task Details</span>
        </button>
      </div>

      <Card className="bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Task</h1>
        <p className="text-gray-600 mb-8">Update the task details below</p>

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
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              onClick={() => navigate(`/tasks/${id}`)}
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

export default EditTask;
