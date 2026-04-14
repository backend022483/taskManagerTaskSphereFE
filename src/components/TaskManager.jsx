import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import Card from './Card';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
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

  const getStatusInfo = (status) => {
    return taskStatuses.find(s => s.value === status) || taskStatuses[0];
  };

  const getPriorityInfo = (priority) => {
    return taskPriorities.find(p => p.value === priority) || taskPriorities[1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Task Manager</h2>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="primary"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'Create New Task'}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </Card>

      {showCreateForm && (
        <Card className="bg-white shadow-lg rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter task title"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter task description"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {taskStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (editingTask ? 'Update Task' : 'Create Task')}
              </Button>
              <Button
                type="button"
                onClick={resetForm}
                variant="secondary"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="bg-white shadow-lg rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Your Tasks</h3>
          <Button
            onClick={fetchTasks}
            variant="secondary"
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Tasks'}
          </Button>
        </div>

        {loading && tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No tasks found. Create your first task!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => {
              console.log('Rendering individual task:', task);
              console.log('Task title:', task.title);
              console.log('Task description:', task.description);
              console.log('Task status:', task.status);
              
              const statusInfo = getStatusInfo(task.status);
              const priorityInfo = getPriorityInfo(task.priority);
              
              return (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.title || 'No Title'}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </span>
                        {task.created_at && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Created: {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        onClick={() => handleEdit(task)}
                        variant="secondary"
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors text-sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(task.id)}
                        variant="danger"
                        disabled={loading}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors text-sm disabled:opacity-50"
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
    </div>
  );
};

export default TaskManager;
