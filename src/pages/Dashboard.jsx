import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const navigate = useNavigate();

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    highPriority: tasks.filter(t => t.priority === 'high').length,
    mediumPriority: tasks.filter(t => t.priority === 'medium').length,
    lowPriority: tasks.filter(t => t.priority === 'low').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your task overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{taskStats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">To Do</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{taskStats.todo}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{taskStats.inProgress}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{taskStats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Priority Distribution */}
      <Card className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Priority Distribution</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{taskStats.highPriority}</p>
            <p className="text-sm text-red-700">High Priority</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">{taskStats.mediumPriority}</p>
            <p className="text-sm text-yellow-700">Medium Priority</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{taskStats.lowPriority}</p>
            <p className="text-sm text-green-700">Low Priority</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-blue-700 font-medium">View All Tasks</span>
          </button>
          <button
            onClick={() => navigate('/tasks/create')}
            className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-green-700 font-medium">Create New Task</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
