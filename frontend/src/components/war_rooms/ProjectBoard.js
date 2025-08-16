import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

// A new sub-component for managing the task list
const TaskManager = ({ project }) => {
  const [tasks, setTasks] = useState(project.tasks || []);
  const [newTask, setNewTask] = useState('');

  const handleAddTask = async () => {
    if (!newTask) return;
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
    <div style={{ marginTop: '15px' }}>
      <strong>Workflow / To-Do List:</strong>
      <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
        <input 
          type="text" 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          placeholder="New task description" 
          style={{ flexGrow: 1, padding: '5px' }} 
        />
        <button onClick={handleAddTask} style={{ padding: '5px 10px' }}>Add Task</button>
      </div>
      <div>
        {tasks.map(task => (
          <div key={task.id}>
            <input 
              type="checkbox" 
              checked={task.isCompleted} 
              onChange={() => handleToggleTask(task.id)} 
            />
            <span style={{ textDecoration: task.isCompleted ? 'line-through' : 'none' }}>
              {task.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ProjectBoard() {
  // ... (State variables and styles remain the same)
  const styles = {
    board: { marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' },
    projectCard: { border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '5px', backgroundColor: '#fafafa' },
    activeProjectCard: { border: '1px solid #007bff', padding: '15px', marginBottom: '10px', borderRadius: '5px', backgroundColor: '#f0f8ff' },
    completedProjectCard: { border: '1px solid #28a745', padding: '15px', marginBottom: '10px', borderRadius: '5px', backgroundColor: '#f0fff0' },
    button: { marginTop: '10px', padding: '8px 12px', border: 'none', cursor: 'pointer' },
    sectionTitle: { borderBottom: '2px solid #eee', paddingBottom: '10px' }
  };
  const { currentUser } = useAuth();
  const [proposedProjects, setProposedProjects] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... (fetchProjects, handleJoinProject, handleLeaveProject, handleResolveProject functions are the same as before)
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
    <div style={styles.board}>
      <div>
        <h3 style={styles.sectionTitle}>My Active Projects</h3>
        {activeProjects.map(project => (
          <div key={project.id} style={styles.activeProjectCard}>
            <h4>{project.title}</h4>
            <p><strong>Duration:</strong> {project.duration}</p>
            <p>{project.description}</p>
            {/* --- NEW TASK MANAGER COMPONENT --- */}
            <TaskManager project={project} />
            <button onClick={() => handleResolveProject(project.id)} style={{...styles.button, backgroundColor: '#28a745', color: 'white'}}>Mark as Complete</button>
            <button onClick={() => handleLeaveProject(project.id)} style={{...styles.button, backgroundColor: '#ffc107', marginLeft: '10px'}}>Leave Project</button>
          </div>
        ))}
      </div>
      {/* ... (Available and Completed sections remain the same) ... */}
      <div>
        <h3 style={styles.sectionTitle}>Available Projects</h3>
        {proposedProjects.map(project => (
          <div key={project.id} style={styles.projectCard}>
            <h4>{project.title}</h4>
            <p><strong>Duration:</strong> {project.duration}</p>
            <p>{project.description}</p>
            <button onClick={() => handleJoinProject(project.id)} style={{...styles.button, backgroundColor: '#17a2b8', color: 'white'}}>Take On Project</button>
          </div>
        ))}
      </div>
      <div>
        <h3 style={styles.sectionTitle}>My Completed Projects</h3>
        {completedProjects.map(project => (
          <div key={project.id} style={styles.completedProjectCard}>
            <h4>{project.title}</h4>
            <p><strong>Status:</strong> {project.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}