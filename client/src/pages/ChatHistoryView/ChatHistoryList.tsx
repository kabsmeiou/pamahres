
import { ChatHistoryProps } from "../../types/course"
import { ChatHistoryCard } from "./ChatHistoryCard"

export const ChatHistoryList = (  { histories }: { histories: ChatHistoryProps[] })  => {
    // render cards with name_filter only
    console.log("ChatHistoryList", histories);
    return (
        <div className="flex flex-col h-full">
            {histories.length > 0 ? (
                <ul className="w-full max-w-3xl space-y-4 max-h-[calc(70vh)] overflow-y-auto">
                    {histories.map((item, idx) => (
                        <ChatHistoryCard
                            key={idx}
                            date_created={item.date_created}
                            id={item.id} 
                        />                    
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600 dark:text-gray-400">No chat history found.</p>
            )}
        </div>
    )
};

/* 
<div className="text-gray-800 dark:text-gray-200">
    {item.previous_messages.map((msg, msgIdx) => (
        <div key={msgIdx} className={`mb-2 ${msg.sender === 'user' ? 'text-gray-800 dark:text-gray-200' : 'text-primary-700 dark:text-primary-400'}`}>
            <span className="font-medium">{msg.sender === 'user' ? 'You' : 'AI'}:</span> {msg.content}
        </div>
    ))}
</div> */