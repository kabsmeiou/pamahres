import { FolderMinus } from 'react-feather';

interface EmptyFallbackProps {
  message?: string;
  description?: string;
}

function EmptyFallback({ 
  message = "No data found", 
  description = "There's nothing here yet. Items will appear here once they are created."
}: EmptyFallbackProps) {
  return (
    <div className="flex flex-col justify-center items-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FolderMinus className="text-gray-400" size={24} />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">{message}</h3>
      <p className="text-gray-500 text-sm max-w-md">{description}</p>
    </div>
  );
}

export default EmptyFallback;