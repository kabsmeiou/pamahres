import { useQuery } from '@tanstack/react-query';
import { useChatbot } from '../../services/chatbot';
import { useParams } from 'react-router-dom';
import { ChatHistoryProps } from '../../types/course';
import { ChatHistoryList } from '../../components/ChatHistoryList';

const ChatHistory = () => {
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
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold mb-4">Chat History</h1>
                <p className="text-gray-600 dark:text-gray-400">Loading chat history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-2xl font-bold mb-4">Chat History</h1>
                <p className="text-red-600 dark:text-red-400">Failed to load chat history.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Chat History</h1>
            {history && history.length > 0 ? (
                <ChatHistoryList histories={history} />
            ) : (
                <p className="text-gray-600 dark:text-gray-400">No chat history found.</p>
            )}
            {/* {messages.length > 0 ? (
                <ul className="w-full max-w-3xl space-y-4 max-h-[calc(70vh)] overflow-y-auto">
                    {messages.map((item: any, idx: number) => (
                        <li key={idx} className={`p-3 rounded-lg shadow-sm border ${
                            item.role === 'user' 
                              ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                              : 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800/40'
                        }`}>
                            <div className={`font-medium mb-1 ${
                                item.role === 'user'
                                  ? 'text-gray-700 dark:text-gray-300'
                                  : 'text-primary-700 dark:text-primary-400'
                            }`}>
                                {item.role === 'user' ? 'You' : 'AI'}:
                            </div>
                            <div className={`${
                                item.role === 'user'
                                  ? 'text-gray-800 dark:text-gray-200'
                                  : 'text-gray-900 dark:text-gray-100'
                            }`}>
                                {item.content}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600 dark:text-gray-400">No chat history found.</p>
            )} */}
        </div>
    );
}

export default ChatHistory;