import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import './ContentPost.css';

const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
        }
    } catch (e) {
        const match = url.match(/(?:v=|\/embed\/|\.be\/)([^&?#]+)/);
        if (match) videoId = match[1];
    }
    return videoId ? 'https://www.youtube.com/embed/${videoId}' : null;
};

// Now accepts onDeletePost as a prop
export default function ContentPost({ post, onDeletePost }) {
    const { currentUser, userProfile } = useAuth();
    const embedUrl = getYouTubeEmbedUrl(post.youtubeLink);

    // State for interactive elements
    const [likes, setLikes] = useState(post.likes || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState(post.comments || []);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    
    useEffect(() => {
        if (currentUser && post.likedBy?.includes(currentUser.uid)) {
            setIsLiked(true);
        }
    }, [currentUser, post.likedBy]);

    const handleLike = async () => {
        if (!currentUser) return;
        const postRef = doc(db, 'content', post.id);
        
        if (isLiked) {
            await updateDoc(postRef, {
                likes: increment(-1),
                likedBy: arrayRemove(currentUser.uid)
            });
            setLikes(likes - 1);
            setIsLiked(false);
        } else {
            await updateDoc(postRef, {
                likes: increment(1),
                likedBy: arrayUnion(currentUser.uid)
            });
            setLikes(likes + 1);
            setIsLiked(true);
        }
    };
    
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        const commentToAdd = {
            text: newComment,
            author: userProfile.name,
            uid: currentUser.uid,
            createdAt: new Date(),
        };

        const postRef = doc(db, 'content', post.id);
        await updateDoc(postRef, {
            comments: arrayUnion(commentToAdd)
        });

        setComments([...comments, commentToAdd]);
        setNewComment('');
    };

    // Check if the current user is the author of the post
    const isOwner = currentUser && currentUser.uid === post.createdBy;

    return (
        <div className="content-post">
            {/* --- NEW: Conditionally render the delete button --- */}
            {isOwner && (
                <button onClick={() => onDeletePost(post.id)} className="delete-post-button">
                    &times;
                </button>
            )}

            <div className="post-header">
                <span className="post-author">{post.creatorName}</span>
                <span className="post-meta">posted a {post.contentType}</span>
            </div>
            <div className="post-body">
                <p className="post-claim-text">For the claim: "{post.claimText}"</p>
                <p className="post-description">{post.description}</p>
                
                {post.contentType === 'Short' && embedUrl && (
                    <div className="post-media-short">
                        <iframe
                            src={embedUrl}
                            title={post.description}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
                {post.contentType === 'Meme' && post.imageUrl && (
                    <div className="post-media-meme">
                        <img src={post.imageUrl} alt={post.description} />
                    </div>
                )}
            </div>
            <div className="post-footer">
                <button onClick={handleLike} className={`footer-button ${isLiked ? 'liked' : ''}`}>
                    👍 Like ({likes})
                </button>
                <button onClick={() => setShowComments(!showComments)} className="footer-button">
                    💬 Comment ({comments.length})
                </button>
            </div>
            {showComments && (
                <div className="comments-section">
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="comment-input"
                        />
                        <button type="submit" className="comment-submit-btn">Post</button>
                    </form>
                    <div className="comment-list">
                        {comments.slice().sort((a, b) => {
                            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                            return dateB - dateA;
                        }).map((comment, index) => (
                            <div key={index} className="comment">
                                <span className="comment-author">{comment.author}:</span>
                                {comment.text}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}