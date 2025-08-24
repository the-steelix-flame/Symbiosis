import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment, query, orderBy, getDocs, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import ContentPost from '../components/ContentPost';
import './content.css';

export default function ContentCreationPage() {
    const { claimId } = useParams();
    const location = useLocation();
    const { currentUser, userProfile } = useAuth();
    const fileInputRef = useRef(null);

    // Form state
    const [claimText, setClaimText] = useState('');
    const [contentType, setContentType] = useState('Short');
    const [youtubeLink, setYoutubeLink] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Post feed state
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);

    const fetchPosts = async () => {
        setPostsLoading(true);
        const contentRef = collection(db, "content");
        const q = query(contentRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(fetchedPosts);
        setPostsLoading(false);
    };

    useEffect(() => {
        if (location.state?.type) {
            setContentType(location.state.type);
        }
        if (claimId) {
            const fetchClaim = async () => {
                const claimRef = doc(db, 'claims', claimId);
                const docSnap = await getDoc(claimRef);
                if (docSnap.exists()) {
                    setClaimText(docSnap.data().claimText);
                }
            };
            fetchClaim();
        }
        fetchPosts();
    }, [claimId, location.state]);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description) {
            setError('Description is required.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        let finalImageUrl = '';

        try {
            if (contentType === 'Meme' && imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
                const response = await fetch(
                    'https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload',
                    { method: 'POST', body: formData }
                );
                const data = await response.json();
                if (data.secure_url) {
                    finalImageUrl = data.secure_url;
                } else {
                    throw new Error('Image upload failed.');
                }
            }

            await addDoc(collection(db, "content"), {
                createdBy: currentUser.uid,
                creatorName: userProfile.name,
                claimId: claimId || null,
                claimText: claimText || 'General Submission',
                contentType,
                youtubeLink: contentType === 'Short' ? youtubeLink : '',
                imageUrl: finalImageUrl,
                description,
                likes: 0,
                comments: [],
                likedBy: [],
                createdAt: serverTimestamp(),
            });

            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { points: increment(5) });

            setSuccess('Content posted successfully! You earned 5 points.');
            setYoutubeLink('');
            setImageFile(null);
            setDescription('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            fetchPosts();

        } catch (err) {
            setError(err.message || 'Failed to post content.');
            console.error(err);
        }
        setLoading(false);
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm("Are you sure you want to permanently delete this post?")) {
            try {
                await deleteDoc(doc(db, "content", postId));
                fetchPosts();
            } catch (err) {
                console.error("Error deleting post: ", err);
                setError("Failed to delete post. Please try again.");
            }
        }
    };

    return (
        <div className="home-container1">
            <main className="hero-section1" style={{ paddingTop: '120px' }}>
                <h1>Creator Section</h1>
                <p className="subtitle">
                    {claimId ? 'Creating content for the claim: "${claimText}"' : 'Share your own science-backed Short or Meme!'}
                </p>

                <form onSubmit={handleSubmit} className="content-form">
                    {/* --- FIX: Display error and success messages here --- */}
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}

                    <div className="form-group">
                        <label>Content Type</label>
                        <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                            <option value="Short">Short</option>
                            <option value="Meme">Meme</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a caption or explanation..."
                            required
                        />
                    </div>
                    {contentType === 'Short' && (
                        <div className="form-group">
                            <label>YouTube Video Link</label>
                            <input 
                                type="url"
                                value={youtubeLink}
                                onChange={(e) => setYoutubeLink(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>
                    )}
                    {contentType === 'Meme' && (
                        <div className="form-group">
                            <label>Upload Image</label>
                            <input 
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                ref={fileInputRef}
                            />
                        </div>
                    )}
                    <button type="submit" disabled={loading} className="cta-button">
                        {loading ? 'Uploading...' : 'Post and Earn 5 Points'}
                    </button>
                </form>

                <div className="posts-feed">
                    <h2 style={{ marginTop: '3rem', borderTop: '1px solid #4a5568', paddingTop: '2rem' }}>
                        Latest Content
                    </h2>
                    {postsLoading ? (
                        <p>Loading content feed...</p>
                    ) : (
                        posts.map(post => 
                            <ContentPost 
                                key={post.id} 
                                post={post} 
                                onDeletePost={handleDeletePost} 
                            />
                        )
                    )}
                </div>
            </main>
        </div>
    );
}