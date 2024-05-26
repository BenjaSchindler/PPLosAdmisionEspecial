import React, { useState, useRef, useEffect } from 'react';
import { Oval } from 'react-loader-spinner';
import { FaChevronDown } from 'react-icons/fa';
import { Collapse } from 'react-collapse';

const Blitz: React.FC = () => {
    const [question, setQuestion] = useState<string>('');
    const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [resultOption, setResultOption] = useState<string>('output'); // default option
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (question.trim() === '') {
            alert('Please enter a question.');
            return;
        }

        const userMessage = { sender: 'user', text: question };
        setMessages([...messages, userMessage]);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question, resultOption }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const botMessage = { sender: 'bot', text: data.answer || 'No answer received' };
            setMessages([...messages, userMessage, botMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = { sender: 'bot', text: 'Error occurred while fetching answer' };
            setMessages([...messages, userMessage, errorMessage]);
        } finally {
            setLoading(false);
        }

        setQuestion('');
    };

    const toggleOptions = () => {
        setShowOptions(!showOptions);
    };

    const selectOption = (option: string) => {
        setResultOption(option);
        setShowOptions(false);
    };

    return (
        <div className="flex flex-col h-screen" style={{ 
          paddingTop: '60px',
          backgroundImage: "url(https://i.imgur.com/ZNV81El.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
            <div className="absolute top-16 right-4">
                <button
                    type="button"
                    onClick={toggleOptions}
                    className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-600 focus:outline-none focus:ring focus:ring-teal-300"
                >
                    Options <FaChevronDown />
                </button>
                <Collapse isOpened={showOptions}>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <div
                            className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                            onClick={() => selectOption('output')}
                        >
                            Only Output
                        </div>
                        <div
                            className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
                            onClick={() => selectOption('full')}
                        >
                            Show Everything
                        </div>
                    </div>
                </Collapse>
            </div>
            <div className="flex-1 overflow-y-auto p-4 pb-20"> {/* Added padding bottom to ensure space for the input box */}
                <div className="max-w-2xl mx-auto space-y-4">
                    {messages.length === 0 && (
                        <div className="flex justify-center">
                            <img src="https://imgur.com/YXpZPKU.png" alt="Welcome" />
                        </div>
                    )}
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`rounded-lg p-3 ${
                                    message.sender === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-300 text-gray-900'
                                }`}
                                style={{ maxWidth: '75%', margin: '10px' }}
                            >
                                {message.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-center">
                            <Oval
                                height={50}
                                width={50}
                                color="#4fa94d"
                                secondaryColor="#4fa94d"
                                strokeWidth={2}
                                strokeWidthSecondary={2}
                            />
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-transparent" style={{ marginBottom: '20px' }}>
                <form onSubmit={handleSubmit} className="flex space-x-0 mx-auto max-w-2xl relative">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Enter your question"
                        className="flex-1 rounded-l-lg border border-gray-300 p-2 focus:outline-none focus:ring focus:border-blue-300"
                        style={{ borderRight: 'none' }}
                    />
                    <button
                        type="submit"
                        className="bg-teal-500 text-white rounded-r-lg p-2 hover:bg-teal-600 focus:outline-none focus:ring focus:ring-teal-300"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Blitz;



