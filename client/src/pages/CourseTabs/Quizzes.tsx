import { useParams } from 'react-router-dom';
import { useQuizApi } from '../../services/quizzes';
import { useQuery } from '@tanstack/react-query';
import { Quiz } from '../../types/quiz';

import QuizList from '../QuizView/QuizList';
import Loading from '../../components/Loading';
import QuizHeader from '../QuizView/QuizHeader';

const Quizzes = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = parseInt(courseId ?? '', 10);

  const { getQuizzes } = useQuizApi();

  const { data: quizzes, isLoading, error } = useQuery<Quiz[]>({
    queryKey: ['quizzes', numericCourseId],
    queryFn: () => getQuizzes(numericCourseId),
  });

  // const getStatusIcon = (status: Quiz['status']) => {
  //   switch (status) {
  //     case 'completed':
  //       return <CheckCircle size={16} />;
  //     case 'not_started':
  //       return <AlertCircle size={16} />;
  //   }
  // };

  return (
    <div>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20 p-6 border border-blue-200/50 dark:border-blue-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">Course Quizzes</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">Generate quizzes from your course materials</p>
          </div>
          <QuizHeader />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-2xl p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Error loading quizzes</p>
              <p className="text-sm text-red-500 dark:text-red-300">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Content */}
      <div className="bg-white dark:bg-gray-800">
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Loading type="quiz" count={3} />
            </div>
          ) : quizzes && quizzes.length > 0 ? ( 
            <QuizList quizzes={quizzes} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No quizzes available</h3>
              <p className="text-gray-500 dark:text-gray-400">Quizzes will appear here once they're created for this course.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quizzes; 