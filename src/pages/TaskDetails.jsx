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
        <Card className="bg-white shadow-lg rounded-xl p-8 text-center">
          <svg className="w-4 h-4 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'The task you are looking for does not exist.'}</p>
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
    <div className="max-w-4xl mx-auto">
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
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Created</span>
            </div>
            <p className="text-gray-900">
              {task.created_at ? new Date(task.created_at).toLocaleString() : 'N/A'}
            </p>
          </div>
          
          {task.due_date && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Due Date</span>
              </div>
              <p className="text-gray-900">
                {new Date(task.due_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="flex space-x-4 pt-6 border-t border-gray-200">
          <Button
            onClick={() => navigate(`/tasks/${id}/edit`)}
            variant="primary"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Task</span>
          </Button>
          <Button
            onClick={() => navigate('/tasks/create')}
            variant="secondary"
            className="px-6 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Task</span>
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            className="px-6 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TaskDetails;
