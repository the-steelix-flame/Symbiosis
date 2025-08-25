import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import './Leaderboard.css';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopUsers = async () => {
            setLoading(true);
            try {
                const usersRef = collection(db, 'users');
                // Query to get users, ordered by points, and limit to the top 10
                const q = query(usersRef, orderBy('points', 'desc'), limit(10));
                const querySnapshot = await getDocs(q);
                const topUsers = querySnapshot.docs.map(doc => doc.data());
                setUsers(topUsers);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
            setLoading(false);
        };

        fetchTopUsers();
    }, []);

    const getBadge = (rank) => {
        if (rank === 0) return <img src="/gold.png" alt="Gold Badge" className="badge-icon" />;
        if (rank === 1) return <img src="/silver.png" alt="Silver Badge" className="badge-icon" />;
        if (rank === 2) return <img src="/bronze.png" alt="Bronze Badge" className="badge-icon" />;
        return null;
    };

    return (
        <div className="leaderboard-container">
            <h2>Leaderboard</h2>
            {loading ? (
                <p>Loading leaderboard...</p>
            ) : (
                <ol className="leaderboard-list">
                    {users.map((user, index) => (
                        <li key={user.uid} className="leaderboard-item">
                            <span className="leaderboard-rank">
                                {index + 1}
                                {getBadge(index)}
                            </span>
                            <span className="leaderboard-name">{user.name}</span>
                            <span className="leaderboard-points">{user.points || 0} Points</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
};

export default Leaderboard;