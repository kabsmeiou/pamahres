import { ChatHistoryList } from "./ChatHistoryList";
import { useQuery } from '@tanstack/react-query';
import { useChatbot } from '../../services/chatbot';
import { useParams } from 'react-router-dom';
import { ChatHistoryProps } from '../../types/course';

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
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Chat History</h1>
            {history && history.length > 0 ? (
                <ChatHistoryList histories={history} />
            ) : (
                <p className="text-gray-600 dark:text-gray-400">No chat history found.</p>
            )}
        </div>
    );
}

export default ChatHistoryIndex;