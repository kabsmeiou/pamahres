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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 p-6 border border-green-200/50 dark:border-green-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-600 rounded-lg text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">AI Tutor</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">Ask questions about your course materials</p>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="h-full">
        <Chatbox
          showForm={true}
          message={message}
          setMessage={setMessage}
          messages={messages}
          loading={loading}
          fetchLoading={isLoading}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  )
};

export default Course;
