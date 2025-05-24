import { AlertCircle, X } from "react-feather"
import { useEffect, useState } from "react"

type ErrorProps = {
  message: string
  onClose?: () => void
  duration?: number // in ms, default 4000
  title?: string
}

const Error = ({ message, onClose, duration = 4000, title = "Error" }: ErrorProps) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Give time for the fade-out animation before calling onClose
      const closeTimer = setTimeout(() => {
        if (onClose) onClose();
      }, 300);
      return () => clearTimeout(closeTimer);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div 
      className={`fixed top-6 right-6 z-50 transform transition-all duration-300 ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-start gap-3 bg-white border border-red-200 shadow-lg rounded-lg p-4 max-w-md">
        <div className="p-2 bg-red-50 rounded-full flex-shrink-0">
          <AlertCircle className="text-red-600" size={20} />
        </div>
        
        <div className="flex-1 pr-6">
          <h4 className="font-semibold text-gray-800">{title}</h4>
          <p className="text-gray-600 text-sm mt-1">{message}</p>
        </div>
        
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Error;
