import { useParams } from 'react-router-dom';
import { useQuizApi } from '../../services/quizzes';
import { useQuery } from '@tanstack/react-query';
import { Quiz } from '../../types/quiz';

import QuizList from '../QuizView/QuizList';
import Loading from '../../components/Loading';
import EmptyFallback from '../../components/EmptyFallback';
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
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-0 space-y-8">
      <div className="bg-white dark:bg-surface-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-surface-700">
        <QuizHeader />
        
        {/* Error Display */}
        {error && (
          <div className="my-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600">
            <p className="font-medium">Error loading quizzes</p>
            <p className="text-sm">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
          </div>
        )}
        
        {/* Quiz List */}
        <div className="mt-6">
          {isLoading ? (
            <div className="py-6">
              <Loading type="quiz" count={3} />
            </div>
          ) : quizzes && quizzes.length > 0 ? ( 
            <QuizList 
              quizzes={quizzes} 
              />
          ) : (
            <div className="py-8">
              <EmptyFallback />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quizzes; 