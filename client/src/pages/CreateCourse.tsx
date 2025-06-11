import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoursesApi } from '../services/courses';
import { Book, ArrowLeft } from 'react-feather';
import Toast from '../components/Toast';

type ToastProp = {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
};

const CreateCourse = () => {
  const { createCourse } = useCoursesApi();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // State for toast notifications
  const [toast, setToast] = useState<ToastProp | null>(null);
  const [showToast, setShowToast] = useState(false);

  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    course_description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      await createCourse(formData);
      // Navigate to dashboard after successful creation
      navigate('/');
    } catch (error: any) {
      console.error('Error creating course:', error);
      // Show error toast
      setToast({
        message: error.response.data.course_code[0] || 'Failed to create course.',
        type: 'error',
        title: 'Failed to create course.'
      });
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const [loadingText, setLoadingText] = useState('Creating course.');
  // Update loading text every second
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingText(prev => {
        if (prev.endsWith('...')) return 'Creating course.';
        return prev + '.';
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toast Notification */}
      {showToast && toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          title={toast.title}
          onClose={() => setShowToast(false)}
        />
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-100 dark:bg-surface-900 bg-opacity-75 dark:bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-800 p-6 rounded-lg shadow-lg">
            <p className="text-gray-700 dark:text-gray-300">{loadingText}</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Create New Course</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Set up a new course for your study materials</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </button>
      </div>
      
      {/* Course Form */}
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-gray-100 dark:border-surface-700 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 dark:bg-surface-700 border-b border-gray-100 dark:border-surface-600 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
            <Book size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Course Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">All fields are required</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="course_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  id="course_code"
                  value={formData.course_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, course_code: e.target.value }))}
                  placeholder="e.g., CS101"
                  className="w-full rounded-lg border-gray-300 dark:border-surface-600 dark:bg-surface-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">A unique identifier for your course</p>
              </div>
              <div>
                <label htmlFor="course_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  id="course_name"
                  value={formData.course_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, course_name: e.target.value }))}
                  placeholder="e.g., Data Structures and Algorithms"
                  className="w-full rounded-lg border-gray-300 dark:border-surface-600 dark:bg-surface-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The full name of the course</p>
              </div>
            </div>
            <div>
              <label htmlFor="course_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Description
              </label>
              <textarea
                id="course_description"
                value={formData.course_description}
                onChange={(e) => setFormData(prev => ({ ...prev, course_description: e.target.value }))}
                placeholder="Describe what this course is about..."
                rows={4}
                className="w-full rounded-lg border-gray-300 dark:border-surface-600 dark:bg-surface-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Provide a brief description of what students will learn</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-surface-600 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-surface-500 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 dark:bg-primary-700 text-white font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors shadow-sm"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;