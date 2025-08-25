import React, { useState, useEffect } from 'react'; // <--- useRef has been removed from this line
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
    // const fileInputRef = useRef(null); // <--- This line has been removed

    // Form state
    const [claimText, setClaimText] = useState('');
    const [contentType, setContentType] = useState('Short');
    const [youtubeLink, setYoutubeLink] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description) {
            setError('Description is required.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await addDoc(collection(db, "content"), {
                createdBy: currentUser.uid,
                creatorName: userProfile.name,
                claimId: claimId || null,
                claimText: claimText || 'General Submission',
                contentType,
                youtubeLink: contentType === 'Short' ? youtubeLink : '',
                imageUrl: contentType === 'Meme' ? imageUrl : '',
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
            setImageUrl('');
            setDescription('');
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
            <main className="hero-section1">
                <h1>Creator Section</h1>
                <p className="subtitle">
                    {claimId ? `Creating content for the claim: "${claimText}"` : 'Share your own science-backed Short or Meme!'}
                </p>

                <form onSubmit={handleSubmit} className="content-form">
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
                    
                    {contentType === 'Short' ? (
                        <div className="form-group">
                            <label>YouTube Video Link</label>
                            <input 
                                type="url"
                                value={youtubeLink}
                                onChange={(e) => setYoutubeLink(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Image URL</label>
                            <input 
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.png"
                            />
                        </div>
                    )}
                    
                    <button type="submit" disabled={loading} className="cta-button">
                        {loading ? 'Posting...' : 'Post and Earn 5 Points'}
                    </button>
                </form>
            </main>

            <div className="posts-feed">
                <h2>Latest Content</h2>
                {postsLoading ? (
                    <p>Loading content feed...</p>
                ) : (
                    <div className="posts-grid-container">
                        {posts.map(post => 
                            <ContentPost 
                                key={post.id} 
                                post={post} 
                                onDeletePost={handleDeletePost} 
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}