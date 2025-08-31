import React from 'react';
import { Link } from 'react-router-dom';

const PostsSection = () => {
  const posts = [
    {
      id: 1,
      title: "AI Predicts Deforestation Hotspot in the Western Ghats",
      snippet: "Our new predictive model identified three critical zones requiring immediate action, mobilizing local NGOs within hours...",
      author: "EcoSynth AI Unit",
      date: "August 22, 2025",
      image: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 2,
      title: "SDG Scorecard: A New Report on India's Progress",
      snippet: "The latest Eco-Scores reveal significant progress in renewable energy adoption but highlight ongoing challenges in waste management...",
      author: "Symbiosis Data Team",
      date: "August 20, 2025",
      image: "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      id: 3,
      title: "Community Spotlight: The Mumbai Beach Cleanup",
      snippet: "Over 200 volunteers joined our latest initiative, removing 3 tons of plastic waste from Juhu beach...",
      author: "Community Team",
      date: "August 18, 2025",
      image: "https://images.pexels.com/photos/2547565/pexels-photo-2547565.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  return (
    <section className="posts-section">
      <div className="posts-container">
        <h2 className="section-title">Latest from the Field</h2>
        
        <div className="posts-grid">
          {posts.map((post) => (
            <article key={post.id} className="post-card">
              <img 
                src={post.image} 
                alt={post.title} 
                className="post-image"
              />
              <div className="post-content">
                <h3 className="post-title">{post.title}</h3>
                <p className="post-snippet">{post.snippet}</p>
                <div className="post-meta">
                  <span className="post-author">{post.author}</span>
                  <span className="post-date">{post.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        <Link to="/create-content" className="see-all-btn">See all posts</Link>
      </div>
    </section>
  );
};

export default PostsSection;
