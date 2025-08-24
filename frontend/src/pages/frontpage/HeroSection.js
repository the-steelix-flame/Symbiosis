import React from 'react';

const HeroSection = () => {
  const campaigns = [
    {
      id: 1,
      title: "AI-Powered Reforestation",
      description: "Using advanced machine learning to identify optimal reforestation sites and monitor forest health in real-time.",
      image: "https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=600",
      buttonText: "Read More",
      buttonLink: "#reforestation"
    },
    {
      id: 2,
      title: "The Eco-Score Initiative",
      description: "A comprehensive scoring system that tracks environmental progress across Indian cities and regions.",
      image: "https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=600",
      buttonText: "See the Data",
      buttonLink: "#eco-score"
    },
    {
      id: 3,
      title: "Join the Plastic Waste Challenge",
      description: "Community-driven initiatives to reduce plastic waste through innovative recycling and awareness programs.",
      image: "https://images.pexels.com/photos/2547565/pexels-photo-2547565.jpeg?auto=compress&cs=tinysrgb&w=600",
      buttonText: "Act Now",
      buttonLink: "#plastic-challenge"
    }
  ];

  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title animated-title">
            <span className="title-line">Connecting Policies to Action,</span>
            <span className="title-line">Data to Decisions</span>
          </h1>
          <p className="hero-subtitle">
            Symbiosis combines cutting-edge AI and data science with grassroots environmental action 
            to create measurable impact for our planet.
          </p>
        </div>
        
        <div className="campaign-cards">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="campaign-card">
              <img 
                src={campaign.image} 
                alt={campaign.title} 
                className="campaign-image"
              />
              <div className="campaign-content">
                <h3 className="campaign-title">{campaign.title}</h3>
                <p className="campaign-description">{campaign.description}</p>
                <a href={campaign.buttonLink} className="campaign-btn">
                  {campaign.buttonText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
