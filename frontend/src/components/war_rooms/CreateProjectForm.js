import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

// ... (styles remain the same)
const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', padding: '20px', border: '1px solid #eee' },
  input: { padding: '8px', fontSize: '1rem' },
  select: { padding: '8px', fontSize: '1rem' },
  button: { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' },
  skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: '5px', padding: '5px 0' },
  skillTag: { background: '#6c757d', color: 'white', padding: '3px 8px', borderRadius: '10px', fontSize: '0.9rem' },
};

export default function CreateProjectForm({ projectToEdit, onProjectCreated }) {
  const { currentUser } = useAuth();
  const [category, setCategory] = useState('Climate Action');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(''); // --- NEW STATE for duration ---
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [loading, setLoading] = useState(false);
  
  const isEditMode = !!projectToEdit;

  useEffect(() => {
    if (isEditMode) {
      setCategory(projectToEdit.category || 'Climate Action');
      setTitle(projectToEdit.title);
      setDescription(projectToEdit.description);
      setDuration(projectToEdit.duration || '');
      setRequiredSkills(projectToEdit.requiredSkills || []);
    }
  }, [isEditMode, projectToEdit]);
  
  // ... (handleAddSkill function remains the same)
  const handleAddSkill = () => {
    if (currentSkill && !requiredSkills.includes(currentSkill)) {
      setRequiredSkills([...requiredSkills, currentSkill]);
      setCurrentSkill('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // --- ADD duration to the data we save ---
    const projectData = { category, title, description, duration, requiredSkills };

    try {
      if (isEditMode) {
        const projectRef = doc(db, 'projects', projectToEdit.id);
        await updateDoc(projectRef, projectData);
      } else {
        await addDoc(collection(db, 'projects'), {
          ...projectData,
          status: 'proposed',
          createdBy: currentUser.uid,
          creatorRole: 'gov',
          createdAt: serverTimestamp(),
          teamMembers: [],
          tasks: [], // Initialize with an empty tasks array
        });
      }
      if (onProjectCreated) onProjectCreated();
      // Reset form
      // ... (reset other fields)
      setDuration('');
    } catch (error) {
      console.error("Error saving project:", error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* ... (category and title fields) ... */}
      <label htmlFor="category">Project Category</label>
      <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select} required>
        <option value="Climate Action">Climate Action</option>
        <option value="Marine Conservation">Marine Conservation</option>
        <option value="Biodiversity Protection">Biodiversity Protection</option>
      </select>
      
      <label htmlFor="title">Project Title</label>
      <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project Title" style={styles.input} required />
      
      <label htmlFor="description">Project Description</label>
      <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project Description" style={styles.input} required />
      
      {/* --- NEW DURATION FIELD --- */}
      <label htmlFor="duration">Estimated Duration</label>
      <input id="duration" type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 30 Days, 6 Months" style={styles.input} />

      {/* ... (skill tagging section) ... */}
      <div>
        <label>Required Skills</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input type="text" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} placeholder="e.g., Data Analysis" style={{...styles.input, flexGrow: 1}} />
          <button type="button" onClick={handleAddSkill} style={{...styles.button, backgroundColor: '#6c757d'}}>Add Skill</button>
        </div>
        <div style={styles.skillsContainer}>
          {requiredSkills.map(skill => <span key={skill} style={styles.skillTag}>{skill}</span>)}
        </div>
      </div>

      <button type="submit" disabled={loading} style={{...styles.button, marginTop: '10px'}}>
        {isEditMode ? 'Save Changes' : 'Submit Proposal'}
      </button>
    </form>
  );
}