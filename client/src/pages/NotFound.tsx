import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'react-feather';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-surface-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-surface-800 rounded-xl shadow-sm p-8 border border-gray-100 dark:border-surface-700 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl font-bold text-red-500 dark:text-red-400">!</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved to another location.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 dark:bg-primary-700 text-white px-6 py-3 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors shadow-sm font-medium"
          >
            <Home size={18} />
            <span>Go to Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 bg-white dark:bg-surface-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-surface-600 transition-colors border border-gray-200 dark:border-surface-600 shadow-sm font-medium"
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;