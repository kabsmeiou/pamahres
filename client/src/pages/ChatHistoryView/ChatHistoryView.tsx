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
        <div className="space-y-4">
            {/* Navigation Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between">
                    <Link 
                        to={`/courses/${courseId}/chat-history`}
                        className="inline-flex items-center text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        <span className="font-medium">Back to Chat History</span>
                    </Link>
                    
                    {!isLoading && !error && messages && (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <Calendar size={14} />
                            <span>{formattedDate}</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Chat Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden min-h-[600px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-96 p-8">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                            <Clock size={24} className="text-primary-500 dark:text-primary-400 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading conversation</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Retrieving chat history...</p>
                        <div className="w-full max-w-md">
                            <Loading type="default" count={2} />
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center text-center h-96 p-8">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={24} className="text-red-500 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load conversation</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">Sorry, we couldn't retrieve this chat history.</p>
                        <Link 
                            to={`/courses/${courseId}/chat-history`}
                            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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