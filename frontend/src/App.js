import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { FaTrash, FaEdit, FaCheck, FaPlus, FaUndo } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css'; 
import './App.css';

const API_URL = 'http://127.0.0.1:8000/tasks/';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (err) {
      toast.error("Error connecting to server!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
        toast.warning("Title cannot be empty!");
        return;
    }

    try {
      if (editingTask) {
        await axios.put(`${API_URL}${editingTask.id}/`, {
          title,
          description,
          completed: editingTask.completed
        });
        toast.success("Task updated successfully!"); // Popup
        setEditingTask(null);
      } else {
        await axios.post(API_URL, { title, description });
        toast.success("New task added!"); // Popup
      }
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      toast.error("Failed to save task.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      toast.info("Task deleted."); // Popup
      fetchTasks();
    } catch (err) {
      toast.error("Failed to delete task.");
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    try {
      await axios.patch(`${API_URL}${id}/`);
      if (currentStatus) {
        toast.info("Task marked as pending.");
      } else {
        toast.success("Task completed! 🎉");
      }
      fetchTasks();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      {/* The Popup Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="main-content">
        <header>
          <h1>🚀 Task Manager</h1>
          <p>Organize your day efficiently</p>
        </header>

        {/* Form Card */}
        <div className="card form-card">
          <h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="What needs to be done?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="input-group">
                <textarea
                    placeholder="Add a description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                />
            </div>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {editingTask ? <><FaEdit /> Update</> : <><FaPlus /> Add Task</>}
                </button>
                {editingTask && (
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                            setEditingTask(null);
                            setTitle('');
                            setDescription('');
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>
          </form>
        </div>

        {/* Task List */}
        <div className="task-list">
          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`card task-card ${task.completed ? 'completed' : ''}`}>
                <div className="task-content" onClick={() => handleToggleComplete(task.id, task.completed)}>
                    <div className="checkbox">
                        {task.completed && <FaCheck />}
                    </div>
                    <div className="task-text">
                        <h3>{task.title}</h3>
                        {task.description && <p>{task.description}</p>}
                        <small>{new Date(task.created_at).toLocaleDateString()}</small>
                    </div>
                </div>
                
                <div className="task-actions">
                    <button 
                        className="icon-btn edit-btn" 
                        onClick={() => startEditing(task)}
                        title="Edit"
                    >
                        <FaEdit />
                    </button>
                    <button 
                        className="icon-btn delete-btn" 
                        onClick={() => handleDelete(task.id)}
                        title="Delete"
                    >
                        <FaTrash />
                    </button>
                </div>
              </div>
            ))
          )}
          {!loading && tasks.length === 0 && (
            <div className="empty-state">No tasks yet. Start by adding one!</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;