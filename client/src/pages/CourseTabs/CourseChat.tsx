import { useState, useEffect } from 'react';
import { useChatbot } from '../../services/chatbot';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChatMessage } from '../../types/course';
import Chatbox from '../../components/Chatbox';

const Course = () => {
  const { courseId } = useParams();
  const courseIdNumber = parseInt(courseId as string);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { sendMessage, getHistoryToday } = useChatbot();
  const [loading, setLoading] = useState(false);

  const {data: current_messages, isLoading, isError} = useQuery<ChatMessage[]>({
    queryKey: ['chat-history', courseIdNumber],
    queryFn: () => getHistoryToday(courseIdNumber) as Promise<ChatMessage[]>,
    enabled: !!courseIdNumber,
  });

  useEffect(() => {
    if (current_messages) {
      setMessages(current_messages);
    }
  }, [current_messages]);

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
      fetchLoading={isLoading}
      handleSubmit={handleSubmit}
    />
  )
};

export default Course;
