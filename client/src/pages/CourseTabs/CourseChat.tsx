import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MessageCircle, Clock } from 'react-feather';
import { useChatbot } from '../../services/chatbot';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../../types/course';
import Chatbox from '../../components/Chatbox';

const Course = () => {
  const { courseId } = useParams();
  const courseIdNumber = parseInt(courseId as string);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { sendMessage } = useChatbot();
  const [loading, setLoading] = useState(false);

  // client-side storage for current chat history
  useEffect(() => {
    const stored = localStorage.getItem("chat-messages");
    if (stored) {
      setMessages(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chat-messages", JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);

    // Add user message
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // send message to the server
    const jsonMessage = {
      previous_messages: messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      new_message: message,
    }

    console.log("Sending message to server:", jsonMessage);
    const response: any = await sendMessage(jsonMessage, courseIdNumber);
    console.log("Response from server:", response);
    const responseText = response.reply || response.warning;
    
    const aiResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: responseText,
      sender: 'ai'
    };
    
    setMessages(prev => [...prev, aiResponse]);
    setLoading(false);
  };

  return (
    <Chatbox
      showForm={true}
      message={message}
      setMessage={setMessage}
      messages={messages}
      loading={loading}
      handleSubmit={handleSubmit}
    />
  )
};

export default Course;
