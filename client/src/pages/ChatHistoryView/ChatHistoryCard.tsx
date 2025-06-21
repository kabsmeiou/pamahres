import { Link, useParams } from "react-router-dom";
import { ChatHistoryProps } from "../../types/course";

export const ChatHistoryCard = ({
    id,
    date_created
}: {
    id?: number;
    date_created: string;
}) => {
    const { courseId } = useParams<{ courseId: string }>();
    return (
        <div className="space-y-4">
            <div
                className="p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
            >
                <Link
                    to={`/courses/${courseId}/chat-history/${id}`}
                    className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(date_created).toLocaleDateString()}
                </Link>
            </div>
        </div>
    );
}