import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">About Us</h1>
      <p className="text-lg">
        We are a team of passionate developers dedicated to building amazing applications.
      </p>
      <ul className="list-disc pl-8 mt-4">
        <li>Our mission is to create innovative solutions.</li>
        <li>We strive for excellence in everything we do.</li>
        <li>Customer satisfaction is our top priority.</li>
      </ul>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
        Contact Us
      </button>
    </div>
  );
};

export default About;