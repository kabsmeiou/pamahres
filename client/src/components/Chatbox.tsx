import { useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'react-feather';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types/course';

interface ChatboxProps {
    showForm: boolean;
    messages: ChatMessage[];
    setMessage: (message: string) => void;
    message: string;
    loading?: boolean;
    fetchLoading?: boolean;
    handleSubmit: (e: React.FormEvent) => void;
}

const Chatbox = ({ 
    showForm,
    message,
    setMessage,
    messages,
    loading = false,
    fetchLoading = false,
    handleSubmit,
 }: ChatboxProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
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

    return (
        <div className="max-w-6xl max-h-full flex flex-col">
                {/* Messages Area */}
                    <div 
                        className="flex flex-col p-6 lg:p-8 overflow-y-auto space-y-6 bg-gradient-to-b from-surface-50/30 to-white dark:from-surface-900/30 dark:to-surface-900" 
                        ref={messagesContainerRef} 
                        style={{overflowAnchor: 'none'}}
                    >
                        {fetchLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="relative">
                                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-200 dark:border-primary-800"></div>
                                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-primary-600 dark:border-t-primary-400 absolute inset-0"></div>
                                    </div>
                                    <p className="text-surface-500 dark:text-surface-400 font-medium animate-pulse">
                                        Loading conversation...
                                    </p>
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                                <div className="w-16 h-16  rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/60 dark:to-primary-800/40 flex items-center justify-center mb-6">
                                    <MessageCircle size={32} className="text-primary-600 dark:text-primary-400" />
                                </div>
                                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-3 tracking-tight">
                                    Start Your Learning Conversation
                                </h3>
                                <p className="text-surface-600 dark:text-surface-300 max-w-md mb-8 font-medium leading-relaxed">
                                    Ask questions about your course materials, request explanations, or get help with concepts.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                                    <div className="bg-white dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700 text-left">
                                        <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                                            Ask for explanations
                                        </p>
                                        <p className="text-xs text-surface-500 dark:text-surface-400">
                                            "Can you explain this concept in simple terms?"
                                        </p>
                                    </div>
                                    <div className="bg-white dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700 text-left">
                                        <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                                            Get summaries
                                        </p>
                                        <p className="text-xs text-surface-500 dark:text-surface-400">
                                            "Summarize the key points from this material"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map(msg => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    > 
                                        <div
                                            className={`
                                                max-w-[85%] rounded-2xl px-4 py-2 shadow-sm
                                                ${msg.sender === 'user' 
                                                    ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white' 
                                                    : 'bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 border border-surface-200 dark:border-surface-700'
                                                }
                                            `}
                                        >
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown>{msg.content.replace(/\\n/g, '\n')}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Loading indicator for AI response */}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="max-w-[85%] rounded-2xl px-6 py-4 shadow-sm bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 border border-surface-200 dark:border-surface-700">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-primary-400 dark:bg-primary-500 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-primary-400 dark:bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    <div className="w-2 h-2 bg-primary-400 dark:bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                </div>
                                                <span className="text-surface-500 dark:text-surface-400 text-sm font-medium">
                                                    AI is thinking...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Message Input */}
                    {showForm && (
                        <div className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 lg:p-8">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onInput={() => {
                                            if (textareaRef.current) {
                                                textareaRef.current.style.height = 'auto'
                                                textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSubmit(e)
                                            }
                                        }}
                                        placeholder="Ask anything about your course materials..."
                                        className="w-full px-6 py-4 pr-16 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 resize-none min-h-[60px] max-h-[120px] shadow-sm"
                                        rows={1}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!message.trim() || loading}
                                        className="absolute right-3 bottom-3 p-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-surface-500 dark:text-surface-400">
                                        Press Enter to send, Shift+Enter for new line
                                    </span>
                                    <span className="text-surface-400 dark:text-surface-500">
                                        Powered by AI
                                    </span>
                                </div>
                            </form>
                        </div>
                    )}
            </div>
    );
};

export default Chatbox;