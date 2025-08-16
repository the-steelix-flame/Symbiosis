import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

// ... (styles remain the same)
const styles = {
    container: { marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' },
    projectCard: { border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '5px', backgroundColor: '#fafafa' },
    sectionTitle: { borderBottom: '2px solid #eee', paddingBottom: '10px' },
    skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: '5px', padding: '5px 0' },
    skillTag: { background: '#6c757d', color: 'white', padding: '3px 8px', borderRadius: '10px', fontSize: '0.9rem' },
    button: { marginTop: '10px', padding: '8px 12px', border: 'none', cursor: 'pointer', borderRadius: '4px' }
};

export default function ActiveProjectsList() {
  const { currentUser } = useAuth();
  const [activeProjects, setActiveProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!currentUser) return; // Don't fetch if there's no user
    setLoading(true);
    try {
        // This query for active projects is correct - it fetches all active projects
        const activeQ = query(collection(db, "projects"), where("status", "==", "active"));
        const activeSnap = await getDocs(activeQ);
        setActiveProjects(activeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        // --- THIS IS THE CORRECTED QUERY FOR COMPLETED PROJECTS ---
        // It now filters for projects that are 'completed' AND include the current user's ID.
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
  }, [currentUser]); // The dependency is the currentUser object

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
    <div style={styles.container}>
      <div>
        <h3 style={styles.sectionTitle}>Active Projects on the Platform</h3>
        {activeProjects.map(project => {
          const isMember = project.teamMembers && project.teamMembers.includes(currentUser.uid);
          return (
            <div key={project.id} style={styles.projectCard}>
              <h4>{project.title}</h4>
              <p><strong>Category:</strong> {project.category}</p>
              <p>{project.description}</p>
              <p><strong>Progress:</strong> {getProgress(project)}</p>
              <div style={styles.skillsContainer}>
                <strong>Skills Needed: </strong>
                {project.requiredSkills && project.requiredSkills.map(skill => <span key={skill} style={styles.skillTag}>{skill}</span>)}
              </div>
              {isMember ? (
                <button onClick={() => handleWithdraw(project.id)} style={{...styles.button, backgroundColor: '#dc3545', color: 'white'}}>Withdraw from Project</button>
              ) : (
                <button onClick={() => handleJoinTeam(project.id)} style={{...styles.button, backgroundColor: '#17a2b8', color: 'white'}}>Offer My Skills & Join Team</button>
              )}
            </div>
          );
        })}
      </div>
      <div>
        <h3 style={styles.sectionTitle}>My Completed Projects</h3>
        {completedProjects.length > 0 ? (
           completedProjects.map(project => (
            <div key={project.id} style={styles.projectCard}>
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
  );
}

// Helper function - should be inside the file but outside the component
const getProgress = (project) => {
  if (!project.tasks || project.tasks.length === 0) {
    return "No tasks assigned yet.";
  }
  const completed = project.tasks.filter(task => task.isCompleted).length;
  return `${completed} / ${project.tasks.length} tasks complete`;
};