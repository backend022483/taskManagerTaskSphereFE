import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';

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
        await fetch(`https://task-sphere-management.vercel.app/api/tasks/${taskId}/`, {
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
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage and track all your tasks</p>
        </div>
        <button
          onClick={() => navigate('/tasks/create')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow text-xs"
        >
          Create New Task
        </button>
      </div>

      {/* Filters and Sort */}
      <Card className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
        <Card className="bg-white shadow-lg rounded-2xl p-12 text-center border border-gray-100">
<span className="text-2xl text-gray-400 mx-auto mb-4">📝</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first task</p>
          <button
            onClick={() => navigate('/tasks/create')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-1 rounded hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow text-xs"
          >
            Create New Task
          </button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <Card key={task.id} className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {(task.status || 'todo').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {(task.priority || 'medium').charAt(0).toUpperCase() + (task.priority || 'medium').slice(1)} Priority
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    {task.created_at && (
                      <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                    )}
                    {task.due_date && (
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="w-4 h-4 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded hover:opacity-90 transition-colors shadow-sm"
                    title="View"
                  >
<span>👁️</span>
                  </button>
                  <button
                    onClick={() => navigate(`/tasks/${task.id}/edit`)}
                    className="w-4 h-4 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded hover:opacity-90 transition-colors shadow-sm"
                    title="Edit"
                  >
<span>✏️</span>
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="w-4 h-4 flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 text-white rounded hover:opacity-90 transition-colors shadow-sm"
                    title="Delete"
                  >
<span>🗑️</span>
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
