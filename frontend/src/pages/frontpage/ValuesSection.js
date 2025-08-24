import React from 'react';

const ValuesSection = () => {
  const values = [
    {
      id: 1,
      title: "Our Values",
      description:
        "Symbiosis uses data-driven, non-violent action to confront the systems that threaten our environment and pave the way towards a sustainable future."
    },
    {
      id: 2,
      title: "Success Stories",
      description:
        "From policy changes to on-the-ground conservation, our collaborative efforts have led to measurable, positive impacts. Explore our success stories."
    },
    {
      id: 3,
      title: "About Us",
      description:
        "Symbiosis is an independent, collaborative platform connecting researchers, students, NGOs, and communities across India and the world."
    }
  ];

  return (
    <section className="values-section">
      <div className="values-container">
        <div className="values-grid">
          {values.map((value) => (
            <div key={value.id} className="value-card">
              <h3 className="value-title">{value.title}</h3>
              <p className="value-description">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
