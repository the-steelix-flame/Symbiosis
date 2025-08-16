import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const styles = {
  myProjectsCard: { border: '1px solid #28a745', padding: '15px', marginBottom: '10px', borderRadius: '5px', backgroundColor: '#f0fff0' },
  sectionTitle: { borderBottom: '2px solid #eee', paddingBottom: '10px' }
};

export default function MyProjectsList() {
  const { currentUser } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProjects = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const myProjectsQuery = query(
        collection(db, "projects"),
        where("teamMembers", "array-contains", currentUser.uid)
      );
      const querySnapshot = await getDocs(myProjectsQuery);
      const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyProjects(projectsData);
    } catch (error) {
      console.error("Error fetching user's projects:", error);
    }
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  return (
    <div>
      <h3 style={styles.sectionTitle}>My Projects</h3>
      {loading ? (
        <p>Loading your projects...</p>
      ) : myProjects.length > 0 ? (
        myProjects.map(project => (
          <div key={project.id} style={styles.myProjectsCard}>
            <h4>{project.title}</h4>
            <p><strong>Status:</strong> {project.status}</p>
          </div>
        ))
      ) : (
        <p>You haven't joined any projects yet. Find one in the list of active projects below!</p>
      )}
    </div>
  );
}