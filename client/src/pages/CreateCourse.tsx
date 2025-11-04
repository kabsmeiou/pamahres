import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoursesApi } from '../services/courses';
import { useQueryClient } from '@tanstack/react-query';
import { Book, ArrowLeft, CheckCircle, Loader } from 'react-feather';
import Toast from '../components/Toast';

type ToastProp = {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
};

const CreateCourse = () => {
  const { createCourse } = useCoursesApi();
  const queryClient = useQueryClient();

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
      // Invalidate courses query to refresh the course list
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      
      // Show success message briefly before navigating
      setToast({
        message: 'Course created successfully!',
        type: 'success',
        title: 'Success'
      });
      setShowToast(true);
      
      // Navigate to dashboard after brief delay
      setTimeout(() => {
        navigate('/pamahres');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating course:', error);
      // Show error toast
      setToast({
        message: error.response?.data?.course_code?.[0] || 'Failed to create course. Please try again.',
        type: 'error',
        title: 'Error'
      });
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const [loadingText, setLoadingText] = useState('Creating your course');
  // Update loading text every second
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingText(prev => {
        if (prev.endsWith('...')) return 'Creating your course';
        return prev + '.';
      });
    }, 400);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-surface-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
      {/* Toast Notification */}
      {showToast && toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          title={toast.title}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-surface-900/20 dark:bg-surface-950/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-8 shadow-xl border border-surface-200/50 dark:border-surface-800/50 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="relative">
                <Loader className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
                <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-primary-100 dark:border-primary-900 animate-pulse"></div>
              </div>
            </div>
            <p className="text-center text-surface-900 dark:text-surface-100 font-medium text-lg">{loadingText}</p>
            <p className="text-center text-surface-500 dark:text-surface-400 text-sm mt-2">This will only take a moment</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-950/30 dark:to-blue-950/30 border-b border-surface-200/50 dark:border-surface-800/50">
        <div className="absolute inset-0 bg-grid-surface-100/50 dark:bg-grid-surface-800/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <Book className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
                    Create New Course
                  </h1>
                  <p className="text-surface-600 dark:text-surface-300 font-medium leading-relaxed">
                    Set up a new course for your learning journey
                  </p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-surface-900 text-surface-700 dark:text-surface-300 font-medium rounded-xl shadow-sm border border-surface-200 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-200"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="space-y-8">
          {/* Course Form */}
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200/50 dark:border-surface-800/50 shadow-sm overflow-hidden">
            {/* Form Header */}
            <div className="px-6 lg:px-8 py-6 bg-gradient-to-r from-surface-50 to-surface-100/50 dark:from-surface-800/50 dark:to-surface-700/30 border-b border-surface-200 dark:border-surface-800">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                  <Book size={20} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-surface-900 dark:text-white tracking-tight">
                    Course Information
                  </h2>
                  <p className="text-sm text-surface-600 dark:text-surface-300 mt-1 font-medium leading-relaxed">
                    Fill in the details below to create your new course
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 lg:p-8">
              <div className="space-y-8">
                {/* Course Code and Name */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="course_code" className="block text-sm font-semibold text-surface-900 dark:text-white">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      id="course_code"
                      value={formData.course_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, course_code: e.target.value }))}
                      placeholder="e.g., CS101, MATH201"
                      className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 shadow-sm"
                      required
                    />
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      A unique identifier for your course (letters and numbers only)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="course_name" className="block text-sm font-semibold text-surface-900 dark:text-white">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      id="course_name"
                      value={formData.course_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, course_name: e.target.value }))}
                      placeholder="e.g., Introduction to Computer Science"
                      className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 shadow-sm"
                      required
                    />
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      The full descriptive name of your course
                    </p>
                  </div>
                </div>

                {/* Course Description */}
                <div className="space-y-2">
                  <label htmlFor="course_description" className="block text-sm font-semibold text-surface-900 dark:text-white">
                    Course Description *
                  </label>
                  <textarea
                    id="course_description"
                    value={formData.course_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, course_description: e.target.value }))}
                    placeholder="Provide a detailed description of what this course covers, learning objectives, and what students can expect to learn..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 dark:focus:border-primary-400 transition-all duration-200 shadow-sm resize-none"
                    required
                  />
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Help students understand what they'll learn and achieve in this course
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-surface-200 dark:border-surface-800">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 sm:flex-none px-6 py-3 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        <span>Create Course</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Additional Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-200/30 dark:border-blue-800/30 p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  What happens next?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  After creating your course, you'll be able to add materials, create quizzes, and start your learning journey. 
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCourse;