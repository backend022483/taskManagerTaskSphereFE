import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, Clock, Circle, Plus, ArrowRight, Calendar, TrendingUp, ClipboardList, Sparkles, MoreVertical } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState('User');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (err) {
        console.error('Error loading tasks:', err);
      }
    }
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData.username || userData.display_name || 'User');
      } catch (err) {
        setUser(savedUser);
      }
    }
    
    setLoading(false);
  }, []);

  const navigate = useNavigate();

  const taskStats = [
    { title: "Total Tasks", value: tasks.length, icon: ClipboardList, gradient: "from-blue-500 to-blue-600", bg: "bg-blue-50" },
    { title: "To Do", value: tasks.filter(t => t.status === 'todo').length, icon: Circle, gradient: "from-gray-500 to-gray-600", bg: "bg-gray-50" },
    { title: "In Progress", value: tasks.filter(t => t.status === 'in_progress').length, icon: Clock, gradient: "from-amber-500 to-amber-600", bg: "bg-amber-50" },
    { title: "Completed", value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle, gradient: "from-green-500 to-green-600", bg: "bg-green-50" },
  ];

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4 shadow-lg"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar />
      
      {/* MAIN CONTENT */}
      <div className="ml-0 md:ml-64 flex-1 flex flex-col">

        {/* TOP BAR */}
        <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/60 p-4 md:p-6 sticky top-0 z-10">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, {user}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
              </div>
              
              {/* Quick Add Button */}
              <button
                onClick={() => navigate('/tasks/create')}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline font-medium">New Task</span>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-4 md:p-6 space-y-6">

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {taskStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/90 backdrop-blur-lg p-5 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{stat.title}</p>
                  <h3 className="text-2xl lg:text-3xl font-bold mt-1 text-gray-900">
                    {stat.value}
                  </h3>
                </div>
              );
            })}
          </div>

          {/* TASK LIST */}
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100 p-5 md:p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Recent Tasks
                  </h3>
                  <p className="text-sm text-gray-500">Your latest activities</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all font-medium"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-center py-12 md:py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ClipboardList className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks yet</h3>
                <p className="text-gray-500 mb-6">Create your first task to get started!</p>
                <button
                  onClick={() => navigate('/tasks/create')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl shadow-blue-500/30 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate mb-2">{task.title}</h4>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                              task.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : task.status === "in_progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {task.status === 'completed' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                              task.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {task.priority}
                          </span>
                          {task.due_date && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Mobile View All Button */}
                <button
                  onClick={() => navigate('/tasks')}
                  className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl font-medium"
                >
                  View All Tasks <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default Dashboard;
