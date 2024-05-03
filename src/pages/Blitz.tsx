import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

const Blitz: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.offsetHeight;
        const windowHeight = window.innerHeight;
        if (contentHeight > windowHeight) {
          document.body.style.overflowY = 'auto';
        } else {
          document.body.style.overflowY = 'hidden';
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial scroll behavior

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflowY = ''; // Reset overflow style on unmount
    };
  }, [answer]);

  const handleQuestionSubmit = async () => {
    setLoading(true);
    try {
      console.log("Sending question:", question);
      const response = await axios.post('http://localhost:8080/api/ask', { question });
      setAnswer(response.data.answer);
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen py-8">
      <div className="max-w-4xl mx-auto pt-20" ref={contentRef}>
        <h1 className="text-4xl font-bold mb-8 text-center">Blitz</h1>
        <div className="mb-8">
          <div className="flex">
            <input
              type="text"
              className="flex-grow px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleQuestionSubmit}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Submit'}
            </button>
          </div>
        </div>
        {loading && (
          <div className="flex justify-center mt-4">
            <ClipLoader color="#3B82F6" size={40} />
          </div>
        )}
        {answer && (
          <div className="mt-8">
            <pre className="whitespace-pre-wrap">{answer}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blitz;