import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2, FileText, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const TaskList = ({ tasks, onEdit, onDelete, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4 shadow-lg"></div>
          <p className="text-gray-600 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <FileText className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-500 text-sm mb-6 text-center max-w-md">
          Get started by creating your first task to track your work and stay organized.
        </p>
        <button
          onClick={() => navigate('/tasks/create')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
        >
          <FileText className="w-5 h-5" />
          Create Your First Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/60 p-5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-3 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900 truncate">{task.title}</h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {task.priority}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    task.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : task.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  ) : (
                    <Clock className="w-3 h-3 mr-1" />
                  )}
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              {task.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{task.description}</p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                {task.due_date && (
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-blue-500" />
                    {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
                {task.created_at && (
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                    Created {new Date(task.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"
                title="View"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => onEdit(task)}
                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"
                title="Edit"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
