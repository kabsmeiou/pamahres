import { useState, useEffect, useRef } from 'react';
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
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingContentRef = useRef<string>('');
  const animationFrameRef = useRef<number | null>(null);

  const {data: current_messages, isLoading} = useQuery<ChatMessage[]>({
    queryKey: ['chat-history', courseIdNumber],
    queryFn: () => getHistoryToday(courseIdNumber) as Promise<ChatMessage[]>,
    enabled: !!courseIdNumber,
  });

  useEffect(() => {
    if (current_messages) {
      setMessages(current_messages);
    }
  }, [current_messages]);

  // Cleanup: abort any ongoing stream when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Abort previous stream if still running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);

    // Add user message
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: 'user'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // send message to the server
      const jsonMessage = {
        previous_messages: messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        new_message: message,
      }
      const response = await sendMessage(jsonMessage, courseIdNumber);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }
      const decoder = new TextDecoder('utf-8');

      let fullResponse = '';
      // Add a placeholder AI message immediately 
      const aiMessageId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        { id: aiMessageId, content: '', sender: 'ai' }
      ]);

      // Throttled update function using requestAnimationFrame
      let pendingUpdate = false;
      const scheduleUpdate = (content: string) => {
        streamingContentRef.current = content;
        
        if (!pendingUpdate) {
          pendingUpdate = true;
          animationFrameRef.current = requestAnimationFrame(() => {
            setMessages(prev => {
              const newMessages = [...prev];
              const lastIndex = newMessages.length - 1;
              if (newMessages[lastIndex]?.id === aiMessageId) {
                newMessages[lastIndex] = {
                  ...newMessages[lastIndex],
                  content: streamingContentRef.current
                };
              }
              return newMessages;
            });
            pendingUpdate = false;
          });
        }
      };
      let buffer = '';
      while (true) {
        const { value, done: doneReading } = await reader.read();
        if (doneReading) break;
        // Decode with streaming mode to handle multi-byte UTF-8 correctly
        const chunkText = decoder.decode(value, { stream: true });
        buffer += chunkText;
        // Parse SSE format: lines starting with "data: "
        const lines = buffer.split('\n');
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove "data: " prefix
            fullResponse += data;
            
            // Schedule throttled update
            scheduleUpdate(fullResponse);
          }
        }
        setLoading(false);
      }

      // Final flush for any remaining bytes
      const finalChunk = decoder.decode();
      if (finalChunk) {
        buffer += finalChunk;
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            fullResponse += data;
          }
        }
      }

      // Cancel any pending animation frame and do final update immediately
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Finalize the AI message (trim extra whitespace)
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex]?.id === aiMessageId) {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: fullResponse.trim()
          };
        }
        return newMessages;
      });
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Stream error:', error);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header Section */}
      {/* if messages exist, dont show the header */}
      {!messages.length && (
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
      )}

      {/* Chat Content */}
      <div className='h-full min-h-0'>
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
