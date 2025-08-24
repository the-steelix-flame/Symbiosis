import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import './ProjectLists.css'; // Import the shared CSS

export default function MyProjectsList() {
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchMyProjects = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(collection(db, "projects"), where("teamMembers", "array-contains", currentUser.uid));
    const querySnapshot = await getDocs(q);
    setMyProjects(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  const handleLeaveProject = async (projectId) => {
     if (!currentUser) return;
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      teamMembers: arrayRemove(currentUser.uid)
    });
    fetchMyProjects(); // Refresh the list
  };

  if (loading) return <p>Loading your projects...</p>;
  if (!currentUser) return null;

  return (
    <div className="project-list-container">
      <h3>My Joined Projects</h3>
      <div className="project-grid">
        {myProjects.length > 0 ? myProjects.map(project => (
          <div key={project.id} className="list-project-card">
            <div className="card-content">
              <h4>{project.title}</h4>
              <p><strong>Category:</strong> {project.category}</p>
              <p><strong>Status:</strong> {project.status}</p>
            </div>
            <button onClick={() => handleLeaveProject(project.id)} className="list-action-button leave-button">
              Leave Project
            </button>
          </div>
        )) : <p>You haven't joined any projects yet.</p>}
      </div>
    </div>
  );
}