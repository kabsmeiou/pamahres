import { Link, useParams } from "react-router-dom";
import { MessageSquare, ArrowRight, Calendar } from "react-feather";

export const ChatHistoryCard = ({
    id,
    date_created
}: {
    id?: number;
    date_created: string;
}) => {
    const { courseId } = useParams<{ courseId: string }>();
    
    const formattedDate = new Date(date_created).toLocaleDateString("en-US", {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    const formattedTime = new Date(date_created).toLocaleTimeString("en-US", {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return (
        <div className="group">
            <div className="p-5 border border-surface-200 dark:border-surface-700 rounded-xl bg-white dark:bg-surface-800 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary-200 dark:hover:border-primary-800/50">
                <Link
                    to={`/courses/${courseId}/chat-history/${id}`}
                    className="flex items-center justify-between group-hover:text-primary-600 dark:group-hover:text-primary-400"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-800/40 transition-colors">
                            <MessageSquare size={18} />
                        </div>
                        <div>
                            <div className="font-medium text-surface-800 dark:text-surface-200 mb-1 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                                Chat Session
                            </div>
                            <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                                <Calendar size={12} />
                                <span>{formattedDate} at {formattedTime}</span>
                            </div>
                        </div>
                    </div>
                    <ArrowRight size={18} className="text-surface-400 dark:text-surface-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}