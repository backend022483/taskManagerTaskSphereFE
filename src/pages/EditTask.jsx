import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
        <div className="bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-100">
<span className="text-2xl text-red-500 mx-auto mb-4">⚠️</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/tasks')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow text-xs"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/tasks/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
<span>←</span>
            <span className="text-sm">Back to Task Details</span>
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="mx-auto h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 shadow mb-4">
<span>✏️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Task</h1>
            <p className="text-gray-500">Update the task details below</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/tasks/${id}`)}
                className="px-1 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTask;
