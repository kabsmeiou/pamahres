
import { Outlet } from 'react-router-dom';

const ChatHistory = () => {
    return (
        <div className="h-full">
            <Outlet />
        </div>
    );
}

export default ChatHistory;