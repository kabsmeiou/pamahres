import { ChatMessage } from "../../types/course"
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from "react-router-dom";
import { useChatbot } from "../../services/chatbot";
import Chatbox from "../../components/Chatbox";
import { AlertCircle, Clock, ChevronLeft, Calendar } from "react-feather";
import Loading from "../../components/Loading";

const ChatHistoryView = () => {
    const { courseId, chatId } = useParams<{ courseId: string, chatId: string }>();
    const { getHistoryMessages } = useChatbot();

    const { data: messages, isLoading, error } = useQuery<ChatMessage[]>({
        queryKey: ['chatHistoryMessages', courseId, chatId],
        queryFn: () => getHistoryMessages(Number(courseId), Number(chatId)) as Promise<ChatMessage[]>,
        enabled: !!courseId && !!chatId
    });

    // Create a formatted date for display
    const currentDate = new Date();
    
    const formattedDate = currentDate.toLocaleDateString("en-US", {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <Link 
                    to={`/courses/${courseId}/chat-history`}
                    className="inline-flex items-center text-surface-600 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 transition-colors mb-4"
                >
                    <ChevronLeft size={16} className="mr-1" />
                    <span>Back to Chat History</span>
                </Link>
                
                {!isLoading && !error && messages && (
                    <div className="flex items-center gap-2 text-surface-500 dark:text-surface-400 text-sm mb-2">
                        <Calendar size={14} />
                        <span>{formattedDate}</span>
                    </div>
                )}
            </div>
            
            <div className="flex-1 bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full p-8">
                        <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                            <Clock size={20} className="text-primary-500 dark:text-primary-400 animate-pulse" />
                        </div>
                        <p className="text-surface-600 dark:text-surface-400 mb-4">Loading conversation history...</p>
                        <div className="w-full max-w-md">
                            <Loading type="default" count={2} />
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center h-full p-8">
                        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={20} className="text-red-500 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-medium text-surface-800 dark:text-surface-200 mb-2">Failed to load conversation</h3>
                        <p className="text-surface-600 dark:text-surface-400 mb-2">Sorry, we couldn't retrieve this chat history.</p>
                        <Link 
                            to={`/courses/${courseId}/chat-history`}
                            className="text-primary-600 dark:text-primary-400 hover:underline mt-2"
                        >
                            Return to chat history
                        </Link>
                    </div>
                ) : typeof messages !== "undefined" ? (
                    <div className="h-full">
                        <Chatbox
                            showForm={false}
                            messages={messages || []}
                            setMessage={() => {}}
                            message={""}
                            handleSubmit={() => {}}
                        />
                    </div>
                ) : null }
            </div>
        </div>
    )
};

export default ChatHistoryView;