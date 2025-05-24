import { useState } from 'react';

const Chatbox = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Add the message to the chat history
      setMessages((prevMessages) => [...prevMessages, message]);
      setMessage(''); // Clear the input field after sending
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-indigo-900">Feature Coming Soon!</h1>
    </div>
  );
};

export default Chatbox;
