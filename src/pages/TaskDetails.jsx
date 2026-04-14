import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const TaskDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTask = () => {
      try {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
          const tasks = JSON.parse(savedTasks);
          const foundTask = tasks.find(t => t.id === parseInt(id));
          if (foundTask) {
            setTask(foundTask);
          } else {
            setError('Task not found');
          }
        } else {
          setError('No tasks found');
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
      if (token) {
        await fetch(`http://127.0.0.1:8000/api/tasks/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      const savedTasks = localStorage.getItem('tasks');
      const tasks = savedTasks ? JSON.parse(savedTasks) : [];
      const updatedTasks = tasks.filter(t => t.id !== parseInt(id));
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      navigate('/tasks');
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || colors.todo;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-100">
<span className="text-2xl text-red-500 mx-auto mb-4">⚠️</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h3>
          <p className="text-gray-500 mb-4">{error || 'The task you are looking for does not exist.'}</p>
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
<span>←</span>
          <span className="text-sm">Back to Tasks</span>
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
              </span>
            </div>
            
            {task.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
<span>📅</span>
              <span className="text-sm font-medium text-gray-700">Created</span>
            </div>
            <p className="text-gray-900">
              {task.created_at ? new Date(task.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          
          {task.due_date && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
<span>⏰</span>
                <span className="text-sm font-medium text-gray-700">Due Date</span>
              </div>
              <p className="text-gray-900">
                {new Date(task.due_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={() => navigate(`/tasks/${id}/edit`)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md font-medium flex items-center justify-center gap-2"
          >
<span>✏️</span>
            <span>Edit Task</span>
          </button>
          <button
            onClick={() => navigate('/tasks/create')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
<span>+</span>
            <span>Create New Task</span>
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium flex items-center justify-center gap-2"
          >
<span>🗑️</span>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
