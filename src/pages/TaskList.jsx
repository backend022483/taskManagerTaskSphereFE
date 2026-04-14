import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const navigate = useNavigate();

  useEffect(() => {
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (err) {
        console.error('Error loading tasks:', err);
      }
    }
    setLoading(false);
  }, []);

  const handleDelete = async (taskId) => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
      if (token) {
        await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];
    
    if (filter !== 'all') {
      filtered = filtered.filter(task => task.status === filter);
    }
    
    if (sortBy === 'created_at') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return filtered;
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

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage and track all your tasks</p>
        </div>
        <Button
          onClick={() => navigate('/tasks/create')}
          variant="primary"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Task
        </Button>
      </div>

      {/* Filters and Sort */}
      <Card className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tasks</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at">Created Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
          <div className="ml-auto text-sm text-gray-600">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>
      </Card>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card className="bg-white shadow-lg rounded-xl p-12 text-center">
          <svg className="w-4 h-4 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first task</p>
          <Button
            onClick={() => navigate('/tasks/create')}
            variant="primary"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Task
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <Card key={task.id} className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {(task.status || 'todo').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)} Priority
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {task.created_at && (
                      <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                    )}
                    {task.due_date && (
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                    title="View"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigate(`/tasks/${task.id}/edit`)}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
