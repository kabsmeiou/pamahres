import { ChatMessage } from "../../types/course"
import { useQuery } from '@tanstack/react-query';
import { useParams } from "react-router-dom";
import { useChatbot } from "../../services/chatbot";
import Chatbox from "../../components/Chatbox";
const ChatHistoryView = ()  => {
    const { courseId, chatId } = useParams<{ courseId: string, chatId: string }>();
    const { getHistoryMessages } = useChatbot();

    const { data: messages, isLoading, error } = useQuery<ChatMessage[]>({
        queryKey: ['chatHistoryMessages', courseId, chatId],
        queryFn: () => getHistoryMessages(Number(courseId), Number(chatId)) as Promise<ChatMessage[]>,
        enabled: !!courseId && !!chatId
    });
    console.log("messages", messages);
    return (
        <div className="flex flex-col h-full">
            {isLoading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
            ) : error ? (
                <p className="text-red-600 dark:text-red-400">Failed to load messages.</p>
            ) : typeof messages !== "undefined" ? (
                <Chatbox
                    showForm={false}
                    messages={messages || []}
                    setMessage={() => {}}
                    message={""}
                    handleSubmit={() => {}}
                />
            ) : null }
        </div>
    )
};

export default ChatHistoryView;