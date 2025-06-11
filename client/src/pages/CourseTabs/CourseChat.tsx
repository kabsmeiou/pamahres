import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, MessageCircle, Clock } from 'react-feather';
import { useChatbot } from '../../services/chatbot';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
}

const Course = () => {
  const { courseId } = useParams();
  const courseIdNumber = parseInt(courseId as string);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const { sendMessage } = useChatbot();

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);

    // Add user message
    const newMessage: Message = {
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
    
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: responseText,
      sender: 'ai'
    };
    
    setMessages(prev => [...prev, aiResponse]);
    setLoading(false);
  };

  return (
    <div className="max-w-8xl mx-auto py-6 sm:px-6 sm:py-0 h-[calc(100vh-8rem)] dark:bg-surface-900">
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-gray-100 dark:border-surface-700 flex flex-col h-full overflow-hidden w-full sm:w-auto">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-surface-700 bg-white dark:bg-surface-800 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <MessageCircle size={20} className="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-md sm:text-lg font-semibold text-gray-800 dark:text-gray-100">Course Assistant</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Ask questions about your course materials</p>
              </div>
            </div>
          </div>
        </div>
        {/* Messages Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col space-y-6 bg-gray-50 dark:bg-surface-900" ref={messagesContainerRef} style={{overflowAnchor: 'none'}}>
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mb-6">
                <Send size={28} />
              </div>
              <h3 className="md:text-xl text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Start a Conversation</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 md:text-base text-base">Ask questions about your course materials, get explanations, or request summaries.</p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                > 
                  <div
                    className={`
                      max-w-[85%] rounded-2xl px-4 py-3 shadow-sm
                      ${msg.sender === 'user' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white dark:bg-surface-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-surface-700'
                      }
                    `}
                  >
                    <div className="prose prose-sm dark:prose-invert w-fit">
                      <ReactMarkdown>{msg.content.replace(/\\n/g, '\n')}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
          {/* Loading indicator for AI response */}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm bg-white dark:bg-surface-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-surface-700 italic opacity-70">
                <p>Typing...</p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="p-2 border-t border-gray-100 dark:border-surface-700 bg-white dark:bg-surface-800 sticky bottom-0">
          <div className="flex flex-col gap-3">
            <div className="relative flex-col items-end rounded-lg border-0 border-gray-200 focus-within:border-0 focus-within:ring-0 transition-all">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onInput={() => {
                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto'
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder="Ask anything about your course..."
                className="max-h-[80px] sm:max-h-[150px] min-h-[60px] w-full flex-1 bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none px-4 py-2 pr-4 overflow-y-auto outline-none focus:ring-0 focus:border-transparent border-0"
                rows={1}
              />
              <div className="bottom-2 right-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 rounded-full transition-colors"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 dark:hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!message.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Press Enter to send, Shift+Enter for a new line
            </div>
          </div>
        </form>
      </div>
    </div>
  )
};

export default Course;
