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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const taskStatuses = [
    { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' }
  ];

  useEffect(() => {
      fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      
        setTasks(tasksData);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
    });
    setEditingTask(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('authToken') || sessionStorage.getItem('backupToken');
    if (!token) {
      setLoading(false);
      return;
    }
    
    
    try {
      if (editingTask) {
        // Update existing task
            title: formData.title,
            description: formData.description,
        
        try {
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: formData.title,
              description: formData.description,
            })
          });
          
          
        
        
          title: formData.title,
          description: formData.description,
          created_at: new Date().toISOString()
        };
        
        setTasks(updatedTasks);
        
      }
      
      resetForm();
    } catch (err) {
      console.error('Error saving task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setFormData({
      title: task.title,
      description: task.description || '',
    });
    setEditingTask(task);
    setShowCreateForm(true);
  };

  const handleDelete = async (taskId) => {
    setLoading(true);
    setError(null);

    try {
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    return taskStatuses.find(s => s.value === status) || taskStatuses[0];
  };

  return (
        {/* Header */}
          <div className="flex justify-between items-center">
                Create New Task
              </Button>
            </div>

          {error && (
            </div>
          )}

      {showCreateForm && (
                type="text"
                value={formData.title}
                placeholder="Enter task title"
                required
              />
              </label>
              <textarea
                value={formData.description}
              />
            </div>
              </label>
              <select
                value={formData.status}
              >
                {taskStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
              >
                {loading ? <Loading size="sm" text="" /> : (editingTask ? 'Update Task' : 'Create Task')}
              </Button>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

          <Loading />
          </div>
              console.log('Rendering individual task:', task);
              console.log('Task title:', task.title);
              console.log('Task description:', task.description);
              console.log('Task status:', task.status);
              
              const statusInfo = getStatusInfo(task.status);
              return (
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                            {task.title || 'No Title'}
                          </h3>
                          {task.description && (
                              {task.description}
                            </p>
                          )}
                          {statusInfo.label}
                        </span>
                        {task.created_at && (
                            Created: {new Date(task.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                        Edit
                      </Button>
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

          {loading ? <Loading size="sm" text="" /> : 'Refresh Tasks'}
        </Button>
      </div>
    </div>
  );
};

export default TaskManager;
