import { FolderMinus, Book, Plus } from 'react-feather';
import { Link } from 'react-router-dom';

interface EmptyFallbackProps {
  message?: string;
  description?: string;
  icon?: 'folder' | 'book';
  actionText?: string;
  actionLink?: string;
}

function EmptyFallback({ 
  message = "No data found", 
  description = "There's nothing here yet. Items will appear here once they are created.",
  icon = 'folder',
  actionText,
  actionLink
}: EmptyFallbackProps) {
  return (
    <div className="flex flex-col justify-center items-center py-16 px-4 text-center border border-dashed border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50/50 dark:bg-surface-800/30">
      <div className="w-24 h-24 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/40 dark:to-primary-800/30 rounded-full flex items-center justify-center mb-6 shadow-md">
        {icon === 'folder' ? (
          <FolderMinus className="text-primary-500 dark:text-primary-400" size={40} />
        ) : (
          <Book className="text-primary-500 dark:text-primary-400" size={40} />
        )}
      </div>
      <h3 className="text-xl font-semibold text-surface-800 dark:text-surface-100 mb-3">{message}</h3>
      <p className="text-surface-500 dark:text-surface-400 text-base max-w-md mb-5">{description}</p>
      
      {actionText && actionLink && (
        <Link 
          to={actionLink}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:hover:bg-primary-800/40 dark:text-primary-400 dark:hover:text-primary-300 rounded-lg transition-colors"
        >
          <Plus size={18} />
          {actionText}
        </Link>
      )}
    </div>
  );
}

export default EmptyFallback;