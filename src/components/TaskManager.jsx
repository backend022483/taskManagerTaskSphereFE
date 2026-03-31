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
  const [viewMode, setViewMode] = useState('card');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    due_date: '',
    priority: 'medium'
  });

  const taskStatuses = [
    { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' }
  ];

  const taskPriorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    console.log('TaskManager - Initial mount, tasks:', tasks, 'type:', typeof tasks, 'isArray:', Array.isArray(tasks));
    // Load tasks from localStorage first
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        console.log('Loaded tasks from localStorage:', parsedTasks);
        setTasks(parsedTasks);
      } catch (err) {
        console.error('Error loading tasks from localStorage:', err);
      }
    } else {
      console.log('No tasks in localStorage, will fetch from API');
      // Only fetch from API if no local data exists
      fetchTasks();
    }
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    console.log('fetchTasks - Starting, current tasks:', tasks, 'type:', typeof tasks);
    
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
    if (!token) {
      console.log('fetchTasks - No token found');
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      console.log('fetchTasks - Making API call with token:', token.substring(0, 20) + '...');
      const response = await fetch('http://127.0.0.1:8000/api/tasks/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('fetchTasks - Response status:', response.status);
      const data = await response.json();
      console.log('fetchTasks - Response data:', data);
      
      const tasksData = data.results || data || [];
      console.log('fetchTasks - Tasks data to set:', tasksData, 'isArray:', Array.isArray(tasksData));
      
      // Only set tasks if it's an array, otherwise keep current state
      if (Array.isArray(tasksData)) {
        setTasks(tasksData);
        localStorage.setItem('tasks', JSON.stringify(tasksData));
      } else {
        console.log('fetchTasks - Tasks data is not an array, keeping current state');
        // Don't corrupt the state if data is invalid
      }
    } catch (err) {
      console.error('fetchTasks - Error:', err);
      setError('Failed to fetch tasks');
      // Load from local storage if API fails
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      due_date: '',
      priority: 'medium'
    });
    setEditingTask(null);
    setShowCreateForm(false);
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
    
    let apiErrorOccurred = false;
    
    try {
      let response, data;
      
      if (editingTask) {
        // Update existing task
        console.log('Updating task with ID:', editingTask.id);
        
        // First update local state immediately for better UX
        const updatedTasks = tasks.map(task => 
          task.id === editingTask.id ? { 
            ...task, 
            title: formData.title,
            description: formData.description,
            status: formData.status,
            due_date: formData.due_date,
            priority: formData.priority
          } : task
        );
        setTasks(updatedTasks);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        
        // Try to sync with API
        try {
          response = await fetch(`http://127.0.0.1:8000/api/tasks/${editingTask.id}/`, {
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
          
          console.log('Update response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API update failed, but local state was updated:', errorText);
            apiErrorOccurred = true;
          } else {
            data = await response.json();
            console.log('Update response data:', data);
          }
        } catch (apiError) {
          console.error('API update error, but local state was updated:', apiError);
          apiErrorOccurred = true;
        }
      } else {
        // Create new task
        console.log('Creating new task with current tasks count:', tasks.length);
        
        // First, preserve existing tasks to ensure we don't lose them
        const existingTasks = Array.isArray(tasks) ? [...tasks] : [];
        
        // Create the new task locally first (works even if API fails)
        const newTask = {
          id: Date.now(),
          title: formData.title,
          description: formData.description,
          status: formData.status,
          due_date: formData.due_date,
          priority: formData.priority,
          created_at: new Date().toISOString()
        };
        
        console.log('New task created locally:', newTask);
        console.log('Existing tasks preserved:', existingTasks);
        
        // Add new task to preserved existing tasks
        const updatedTasks = [...existingTasks, newTask];
        
        console.log('Updated tasks after adding:', updatedTasks);
        console.log('Updated tasks count:', updatedTasks.length);
        
        // Update local state immediately
        setTasks(updatedTasks);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        
        console.log('Local state updated successfully');
        
        // Try to sync with API (don't block or fail if API fails)
        try {
          response = await fetch('http://127.0.0.1:8000/api/tasks/', {
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
          
          data = await response.json();
          console.log('API sync response:', data);
        } catch (apiError) {
          console.error('API sync error, but local state was preserved:', apiError);
        }
      }
      
      resetForm();
      
      // Don't fetch tasks after creating to avoid overwriting local state
      // User can manually refresh if needed
      
    } catch (err) {
      console.error('Error saving task:', err);
      // Only show error if it's not an API sync error during edit
      if (!editingTask || !apiErrorOccurred) {
        setError(editingTask ? 'Failed to update task' : 'Failed to create task');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo',
      due_date: task.due_date || '',
      priority: task.priority || 'medium'
    });
    setEditingTask(task);
    setShowCreateForm(true);
  };

  const handleDelete = async (taskId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('backupToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Only remove the specific task from local state
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const getStatusInfo = (status) => {
    return taskStatuses.find(s => s.value === status) || taskStatuses[0];
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Main Content */}
      <div>
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Task Management</h1>
              <p className="text-gray-500 text-base">Organize and track your tasks efficiently</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setViewMode('card')} disabled={loading} variant={viewMode === 'card' ? 'default' : 'outline'} className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Card
              </Button>
              <Button onClick={() => setViewMode('table')} disabled={loading} variant={viewMode === 'table' ? 'default' : 'outline'} className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Table
              </Button>
              <Button onClick={() => setShowCreateForm(true)} disabled={loading} className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg shadow-blue-500/30 px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 hover:shadow-xl">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Task
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Filter Controls */}
          <div className="mb-8 bg-[#f0f2f5] rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex space-x-6">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300"
                >
                  <option value="all">All Statuses</option>
                  {taskStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Filter by Priority
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300"
                >
                  <option value="all">All Priorities</option>
                  {taskPriorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

      {showCreateForm && (
        <Card title={editingTask ? 'Edit Task' : 'Create New Task'} className="shadow-xl border-0 mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Task Title
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300 resize-none"
                rows={3}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300"
              >
                {taskStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300"
              >
                {taskPriorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg shadow-blue-500/30 px-5 py-2.5 text-sm">
                {loading ? <Loading size="sm" text="" /> : (editingTask ? 'Update Task' : 'Create Task')}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline" disabled={loading} className="px-5 py-2.5 text-sm">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Tasks" className="shadow-xl border-0">
        {loading ? (
          <Loading />
        ) : !Array.isArray(filteredTasks) ? (
          <div className="text-center py-12">
            <p className="text-red-500 font-medium">Error: Tasks data is not valid</p>
            <Button onClick={() => setTasks([])} className="mt-3">Reset Tasks</Button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">No tasks found. Create your first task!</p>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {console.log('Rendering tasks array:', filteredTasks)}
            {filteredTasks.map(task => {
              console.log('Rendering individual task:', task);
              console.log('Task ID:', task.id);
              console.log('Task title:', task.title);
              console.log('Task description:', task.description);
              console.log('Task status:', task.status);
              console.log('Task keys:', Object.keys(task));
              
              const statusInfo = getStatusInfo(task.status);
              const priorityInfo = taskPriorities.find(p => p.value === task.priority) || taskPriorities[1];
              return (
                <div key={task.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-300 hover:scale-[1.03] hover:-translate-y-1 group cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${statusInfo.color} bg-opacity-20 flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                            {task.title || 'No Title'}
                          </h3>
                          {task.description && (
                            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mb-5">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusInfo.color} shadow-md group-hover:shadow-lg transition-shadow`}>
                          {statusInfo.label}
                        </span>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${priorityInfo.color} shadow-md group-hover:shadow-lg transition-shadow`}>
                          {priorityInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {task.due_date && (
                          <span className="flex items-center bg-blue-50 px-4 py-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        {task.created_at && (
                          <span className="flex items-center bg-purple-50 px-4 py-2 rounded-lg group-hover:bg-purple-100 transition-colors">
                            <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Created: {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-0.5 ml-4">
                      <Button onClick={() => handleViewDetails(task)} variant="outline" size="sm" disabled={loading} className="text-xs px-1.5 py-0.5 rounded-sm font-medium hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all">
                        View
                      </Button>
                      <Button onClick={() => handleEdit(task)} variant="outline" size="sm" disabled={loading} className="text-xs px-1.5 py-0.5 rounded-sm font-medium hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all">
                        Edit
                      </Button>
                      <Button onClick={() => handleDelete(task.id)} variant="danger" size="sm" disabled={loading} className="text-xs px-1.5 py-0.5 rounded-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredTasks.map(task => {
                  const statusInfo = getStatusInfo(task.status);
                  const priorityInfo = taskPriorities.find(p => p.value === task.priority) || taskPriorities[1];
                  return (
                    <tr key={task.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{task.title || 'No Title'}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{task.description || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color} shadow-sm`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${priorityInfo.color} shadow-sm`}>
                          {priorityInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {task.created_at ? new Date(task.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1">
                          <Button onClick={() => handleViewDetails(task)} variant="outline" size="sm" disabled={loading} className="text-xs px-3 py-1.5 rounded-md">
                            View
                          </Button>
                          <Button onClick={() => handleEdit(task)} variant="outline" size="sm" disabled={loading} className="text-xs px-3 py-1.5 rounded-md">
                            Edit
                          </Button>
                          <Button onClick={() => handleDelete(task.id)} variant="danger" size="sm" disabled={loading} className="text-xs px-3 py-1.5 rounded-md">
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="text-center mt-8">
        <Button onClick={fetchTasks} variant="outline" disabled={loading} className="px-5 py-2.5 shadow-md text-sm">
          {loading ? <Loading size="sm" text="" /> : 'Refresh Tasks'}
        </Button>
      </div>

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 transform transition-all">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Task Details</h3>
              <button
                onClick={() => setShowTaskDetails(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-5 shadow-md">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Title</label>
                <p className="text-xl font-bold text-gray-900">{selectedTask.title || 'No Title'}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Description</label>
                <p className="text-gray-700 bg-gray-50 rounded-2xl p-5 leading-relaxed">{selectedTask.description || 'No description'}</p>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Status</label>
                  <span className={`inline-block px-4 py-2.5 rounded-full text-sm font-bold ${getStatusInfo(selectedTask.status).color} shadow-md`}>
                    {getStatusInfo(selectedTask.status).label}
                  </span>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Priority</label>
                  <span className={`inline-block px-4 py-2.5 rounded-full text-sm font-bold ${taskPriorities.find(p => p.value === selectedTask.priority)?.color || taskPriorities[1].color} shadow-md`}>
                    {taskPriorities.find(p => p.value === selectedTask.priority)?.label || 'Medium'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Due Date</label>
                <p className="text-gray-700 flex items-center bg-blue-50 rounded-xl px-4 py-3">
                  <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Created</label>
                <p className="text-gray-700 flex items-center bg-purple-50 rounded-xl px-4 py-3">
                  <svg className="w-5 h-5 mr-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {selectedTask.created_at ? new Date(selectedTask.created_at).toLocaleString() : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex space-x-4 mt-10">
              <Button onClick={() => {
                setShowTaskDetails(false);
                handleEdit(selectedTask);
              }} disabled={loading} className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-xl shadow-blue-500/30 px-6 py-3 text-sm">
                Edit Task
              </Button>
              <Button onClick={() => setShowTaskDetails(false)} variant="outline" disabled={loading} className="flex-1 px-6 py-3 text-sm">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
