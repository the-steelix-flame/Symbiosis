import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import CreateProjectForm from './CreateProjectForm';
import ClaimChallengeList from './ClaimChallengeList'; // 1. Import the component
import './WarRoom.css';

const getProgress = (project) => {
  if (!project.tasks || project.tasks.length === 0) {
    return "No tasks assigned yet.";
  }
  const completed = project.tasks.filter(task => task.isCompleted).length;
  return '${completed} / ${project.tasks.length} tasks complete';
};

export default function GovernmentWarRoom() {
  const { currentUser } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);

  const fetchMyProjects = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    const q = query(collection(db, "projects"), where("createdBy", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);
    const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMyProjects(projects);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  const handleDelete = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "projects", projectId));
        fetchMyProjects();
      } catch (error) {
        console.error("Error deleting project: ", error);
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
  };
  
  const handleFormClose = () => {
    setEditingProject(null);
    fetchMyProjects();
  }

  return (
    <div className="war-room-container">
      <h1>Government Unity Desk</h1>
      <p>Manage your proposed initiatives and track their status.</p>
      <hr />

      {editingProject ? (
        <div className="project-card">
          <h3>Editing "{editingProject.title}"</h3>
          <CreateProjectForm projectToEdit={editingProject} onProjectCreated={handleFormClose} />
          <button onClick={() => setEditingProject(null)} className="action-button cancel-button">
            Cancel Edit
          </button>
        </div>
      ) : (
        <div className="project-card">
          <h3>Propose a New Initiative</h3>
          <CreateProjectForm onProjectCreated={fetchMyProjects} />
        </div>
      )}

      <hr style={{ margin: '20px 0' }} />

      <h3>My Proposals</h3>
      {loading ? <p>Loading your projects...</p> : (
        myProjects.map(project => (
          <div key={project.id} className="project-card">
            <h4>{project.title}</h4>
            <p><strong>Category:</strong> {project.category}</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Team Members:</strong> {project.teamMembers.length}</p>
            <p><strong>Progress:</strong> {getProgress(project)}</p>
            <button onClick={() => handleEdit(project)} className="action-button edit-button">Edit</button>
            <button onClick={() => handleDelete(project.id)} className="action-button delete-button">Delete</button>
          </div>
        ))
      )}
      
      {/* 2. Add the component here */}
      <ClaimChallengeList />
    </div>
  );
}