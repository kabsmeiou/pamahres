
import { ChatHistoryProps } from "../../types/course"
import { ChatHistoryCard } from "./ChatHistoryCard"
import EmptyFallback from "../../components/EmptyFallback"

export const ChatHistoryList = ({ histories }: { histories: ChatHistoryProps[] })  => {
    return (
        <div>
            {histories.length > 0 ? (
                <div className="w-full">
                    <ul className="space-y-4 max-h-[calc(75vh)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-surface-300 dark:scrollbar-thumb-surface-600 scrollbar-track-transparent">
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
        </div>
    )
};