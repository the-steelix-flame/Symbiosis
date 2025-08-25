import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import './ProjectLists.css'; // Import the stylesheet

// Helper function to calculate project progress
const getProgress = (project) => {
  if (!project.tasks || project.tasks.length === 0) {
    return "No tasks assigned yet.";
  }
  const completed = project.tasks.filter(task => task.isCompleted).length;
  // BUG FIX: Changed single quotes to backticks for the template literal to work
  return `${completed} / ${project.tasks.length} tasks complete`;
};

export default function ActiveProjectsList() {
  const { currentUser } = useAuth();
  const [activeProjects, setActiveProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Fetch all active projects
      const activeQ = query(collection(db, "projects"), where("status", "==", "active"));
      const activeSnap = await getDocs(activeQ);
      setActiveProjects(activeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Fetch projects completed by the current user
      const completedQ = query(
        collection(db, "projects"), 
        where("status", "==", "completed"),
        where("teamMembers", "array-contains", currentUser.uid)
      );
      const completedSnap = await getDocs(completedQ);
      setCompletedProjects(completedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error("Error fetching projects:", error);
    }
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleJoinTeam = async (projectId) => {
    await updateDoc(doc(db, 'projects', projectId), { teamMembers: arrayUnion(currentUser.uid) });
    fetchProjects();
  };
  
  const handleWithdraw = async (projectId) => {
    await updateDoc(doc(db, 'projects', projectId), { teamMembers: arrayRemove(currentUser.uid) });
    fetchProjects();
  };

  if (loading) return <p>Loading projects...</p>;

  return (
    <div className="project-list-layout">
      <div className="project-list-container">
        <h3>Active Projects on the Platform</h3>
        <div className="project-grid">
          {activeProjects.map(project => {
            const isMember = project.teamMembers && project.teamMembers.includes(currentUser.uid);
            return (
              <div key={project.id} className="list-project-card">
                <div className="card-content">
                  <h4>{project.title}</h4>
                  <p><strong>Category:</strong> {project.category}</p>
                  <p>{project.description}</p>
                  <p><strong>Progress:</strong> {getProgress(project)}</p>
                  <div className="skills-container">
                    <strong>Skills:</strong>
                    {project.requiredSkills && project.requiredSkills.map(skill => 
                      <span key={skill} className="skill-tag">{skill}</span>
                    )}
                  </div>
                </div>
                {isMember ? (
                  <button onClick={() => handleWithdraw(project.id)} className="list-action-button withdraw-button">
                    Withdraw from Project
                  </button>
                ) : (
                  <button onClick={() => handleJoinTeam(project.id)} className="list-action-button join-button">
                    Offer My Skills & Join Team
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="project-list-container">
        <h3>My Completed Projects</h3>
        <div className="project-grid">
          {completedProjects.length > 0 ? (
            completedProjects.map(project => (
              <div key={project.id} className="list-project-card">
                <h4>{project.title}</h4>
                <p><strong>Category:</strong> {project.category}</p>
                <p><strong>Status:</strong> {project.status}</p>
              </div>
            ))
          ) : (
            <p>You have not completed any projects yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}