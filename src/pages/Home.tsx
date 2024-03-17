import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
      <p className="text-lg">
        This is the home page of your application. You can customize it as needed.
      </p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
        Learn More
      </button>
    </div>
  );
};

export default Home;