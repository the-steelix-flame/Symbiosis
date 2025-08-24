import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import './ProjectBoard.css'; // Import the new CSS file

// Sub-component for managing the task list
const TaskManager = ({ project }) => {
  const [tasks, setTasks] = useState(project.tasks || []);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    const newTaskObj = { description: newTask, isCompleted: false, id: Date.now() };
    const updatedTasks = [...tasks, newTaskObj];
    const projectRef = doc(db, 'projects', project.id);
    await updateDoc(projectRef, { tasks: updatedTasks });
    setTasks(updatedTasks);
    setNewTask('');
  };

  const handleToggleTask = async (taskId) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    );
    const projectRef = doc(db, 'projects', project.id);
    await updateDoc(projectRef, { tasks: updatedTasks });
    setTasks(updatedTasks);
  };

  return (
    <div className="task-manager-container">
      <strong>Workflow / To-Do List:</strong>
      <div className="add-task-form">
        <input 
          type="text" 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          placeholder="New task description" 
          className="add-task-input" 
        />
        <button onClick={handleAddTask} className="add-task-button">Add Task</button>
      </div>
      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className={`task-item ${task.isCompleted ? 'task-item-completed' : ''}`}>
            <input 
              type="checkbox" 
              checked={task.isCompleted} 
              onChange={() => handleToggleTask(task.id)}
            />
            <span>{task.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function ProjectBoard() {
  const { currentUser } = useAuth();
  const [proposedProjects, setProposedProjects] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const proposedQ = query(collection(db, "projects"), where("status", "==", "proposed"));
      const proposedSnap = await getDocs(proposedQ);
      setProposedProjects(proposedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const activeQ = query(collection(db, "projects"), where("status", "==", "active"), where("teamMembers", "array-contains", currentUser.uid));
      const activeSnap = await getDocs(activeQ);
      setActiveProjects(activeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const completedQ = query(collection(db, "projects"), where("status", "==", "completed"), where("teamMembers", "array-contains", currentUser.uid));
      const completedSnap = await getDocs(completedQ);
      setCompletedProjects(completedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) { console.error("Error fetching projects:", error); }
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleJoinProject = async (projectId) => {
    await updateDoc(doc(db, 'projects', projectId), { teamMembers: arrayUnion(currentUser.uid), status: 'active' });
    fetchProjects();
  };
  const handleLeaveProject = async (projectId) => {
    await updateDoc(doc(db, 'projects', projectId), { teamMembers: arrayRemove(currentUser.uid), status: 'proposed' });
    fetchProjects();
  };
  const handleResolveProject = async (projectId) => {
    await updateDoc(doc(db, 'projects', projectId), { status: 'completed' });
    fetchProjects();
  };

  if (loading) return <p>Loading project board...</p>;

  return (
    <div className="project-board">
      <div>
        <h3>My Active Projects</h3>
        {activeProjects.map(project => (
          <div key={project.id} className="active-project-card">
            <h4>{project.title}</h4>
            <p><strong>Duration:</strong> {project.duration}</p>
            <p>{project.description}</p>
            <TaskManager project={project} />
            <div className="project-actions">
              <button onClick={() => handleResolveProject(project.id)} className="action-button complete-button">Mark as Complete</button>
              <button onClick={() => handleLeaveProject(project.id)} className="action-button leave-button">Leave Project</button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3>Available Projects</h3>
        {proposedProjects.map(project => (
          <div key={project.id} className="project-card">
            <h4>{project.title}</h4>
            <p><strong>Duration:</strong> {project.duration}</p>
            <p>{project.description}</p>
            <button onClick={() => handleJoinProject(project.id)} className="action-button join-button">Take On Project</button>
          </div>
        ))}
      </div>

      <div>
        <h3>My Completed Projects</h3>
        {completedProjects.map(project => (
          <div key={project.id} className="completed-project-card">
            <h4>{project.title}</h4>
            <p><strong>Status:</strong> {project.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}