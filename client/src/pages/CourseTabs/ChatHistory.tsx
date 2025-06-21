
import { Outlet } from 'react-router-dom';

const ChatHistory = () => {
    return (
        <div className="flex flex-col max-h-screen">
            <Outlet />
        </div>
    );
}

export default ChatHistory;