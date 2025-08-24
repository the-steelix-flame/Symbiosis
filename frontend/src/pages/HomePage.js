import React from 'react';
import HeroSection from './frontpage/HeroSection';
import PostsSection from './frontpage/PostsSection';
import ValuesSection from './frontpage/ValuesSection';
import Footer from './frontpage/Footer';
//import './HomePage.css'; // Keep your custom styles if needed
import './new.css';

export default function HomePage() {
  return (
    <div className="homepage">
      <HeroSection />
      <PostsSection />
      <ValuesSection />
      <Footer />
    </div>
  );
}
