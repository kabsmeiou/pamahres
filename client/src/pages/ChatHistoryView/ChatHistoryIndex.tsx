import { ChatHistoryList } from "./ChatHistoryList";
import { useQuery } from '@tanstack/react-query';
import { useChatbot } from '../../services/chatbot';
import { useParams } from 'react-router-dom';
import { ChatHistoryProps } from '../../types/course';
import { MessageCircle, AlertCircle, Clock } from 'react-feather';
import Loading from '../../components/Loading';

const ChatHistoryIndex = () => {
    const { getHistory } = useChatbot();
    const { courseId } = useParams<{ courseId: string }>();
    const numericCourseId = parseInt(courseId ?? '', 10);

    // history is an array of objects with previous_messages and name_filter
    const { data: history, isLoading, error } = useQuery<ChatHistoryProps[]>({
        queryKey: ['chatHistory', numericCourseId],
        queryFn: () => getHistory(numericCourseId) as Promise<ChatHistoryProps[]>,
        enabled: !!numericCourseId,
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-600 rounded-lg text-white">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">Chat History</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">Review your past conversations</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-4">
                            <Clock size={24} className="text-orange-500 dark:text-orange-400 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading chat history</h3>
                        <p className="text-gray-600 dark:text-gray-400">Retrieving your conversations...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-600 rounded-lg text-white">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">Chat History</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">Review your past conversations</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={24} className="text-red-500 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load chat history</h3>
                        <p className="text-red-600 dark:text-red-400 mb-2">Something went wrong while loading your conversations.</p>
                        <p className="text-gray-500 dark:text-gray-400">Please try refreshing the page or contact support if the problem persists.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-700/50">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-600 rounded-lg text-white">
                        <MessageCircle size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">Chat History</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">Review your past conversations with course materials</p>
                    </div>
                </div>
            </div>
            
            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl">
                <div className="p-6">
                    {history && history.length > 0 ? (
                        <ChatHistoryList histories={history} />
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No chat history yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                Start a conversation with your course materials to see your chat history here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatHistoryIndex;