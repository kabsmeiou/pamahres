
import { ChatHistoryProps } from "../../types/course"
import { ChatHistoryCard } from "./ChatHistoryCard"
import EmptyFallback from "../../components/EmptyFallback"

export const ChatHistoryList = ({ histories }: { histories: ChatHistoryProps[] })  => {
    return (
        <>
            {histories.length > 0 ? (
                <div className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar">
                    <ul className="space-y-4 p-6">
                        {histories.map((item, idx) => (
                            <li key={idx}>
                                <ChatHistoryCard
                                    date_created={item.date_created}
                                    id={item.id} 
                                />
                            </li>                   
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm p-8">
                    <EmptyFallback 
                        icon="book"
                        message="No chat history yet"
                        description="Start a conversation with your course materials to see your chat history here."
                    />
                </div>
            )}
        </>
    )
};