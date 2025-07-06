import { Clock, FileText, Loader, Trash2, Calendar, CheckCircle, AlertCircle } from "react-feather";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

import { Quiz } from "../../types/quiz";
import { useQuizApi } from "../../services/quizzes";
import { useDeleteItem } from "../../hooks/useDeleteItem";

import ActionConfirmation from "../../components/ActionConfirmation";

const QuizCard = ({quiz}: {quiz: Quiz}) => {
  const { deleteQuiz } = useQuizApi();
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = parseInt(courseId!, 10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // wrapper function to delete quiz with courseId
  // This is necessary because the deleteQuiz function expects an id, but we need to pass courseId as well
  // This is a workaround to match the expected signature of useDeleteItem
  const deleteQuizWithCourse = async (_courseId: number | string, id?: number) => {
    return deleteQuiz(id!);
  };

  const { isDeleting, handleDelete } = useDeleteItem(
    deleteQuizWithCourse,
    (courseId) => ["quizzes", courseId!]
  );

  const handleDeleteConfirm = () => {
    if (quiz.id) {
      handleDelete(numericCourseId, quiz.id, () => setShowDeleteConfirm(false));
    }
  };
  
  const lastTaken = quiz.last_taken
    ? new Date(quiz.last_taken).toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'Not taken yet';

  // Calculate score percentage for visual indicators
  const scorePercentage = quiz.quiz_score && quiz.current_number_of_questions 
    ? (quiz.quiz_score / quiz.current_number_of_questions) * 100 
    : 0;
  const scoreColor = scorePercentage >= 70 ? 'text-green-600 dark:text-green-400' : scorePercentage >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Quiz Info */}
          <div className="flex-1 space-y-4">
            <Link 
              to={`/courses/${courseId}/quizzes/${quiz.id}`}
              state={quiz}
              className="group/link inline-flex items-start gap-4 hover:no-underline cursor-pointer"
            >
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex-shrink-0 group-hover/link:from-blue-200 group-hover/link:to-indigo-200 dark:group-hover/link:from-blue-800/60 dark:group-hover/link:to-indigo-800/60 transition-all duration-200">
                <FileText size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors duration-200 mb-2">
                  {quiz.quiz_title}
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock size={16} />
                    <span className="text-sm font-medium">{quiz.time_limit_minutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <AlertCircle size={16} />
                    <span className="text-sm font-medium">
                      {quiz.number_of_questions === 0 ? 'No questions' : `${quiz.number_of_questions} questions`}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Last taken info */}
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Calendar size={14} />
              <span className="text-sm">{lastTaken}</span>
            </div>
          </div>
          
          {/* Quiz Stats & Actions */}
          <div className="flex flex-col lg:items-end gap-4">
            {/* Score Display */}
            {quiz.quiz_score !== undefined && (
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl px-4 py-3">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${scoreColor}`}>
                    {quiz.quiz_score}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    /{quiz.number_of_questions}
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  scorePercentage >= 70 ? 'bg-green-100 dark:bg-green-900/40' : 
                  scorePercentage >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/40' : 
                  'bg-red-100 dark:bg-red-900/40'
                }`}>
                  <CheckCircle className={scoreColor} size={20} />
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {(quiz.number_of_questions ?? 0) > 0 && quiz.last_taken && (
                <Link
                  to={`/courses/${courseId}/quizzes/${quiz.id}?mode=review`}
                  state={quiz}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Review
                </Link>
              )}
              
              <Link
                to={`/courses/${courseId}/quizzes/${quiz.id}`}
                className="inline-flex items-center justify-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                {quiz.last_taken === null ? 'Take Quiz' : 'Retake Quiz'}
              </Link>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className={`p-2 rounded-lg transition-colors ${
                  isDeleting 
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed" 
                    : "text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                }`}
                title="Delete quiz"
              >
                {isDeleting ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      {quiz.quiz_score !== undefined && !isNaN(scorePercentage) && (
        <div className="h-2 bg-gray-100 dark:bg-gray-700">
          <div 
            className={`h-full transition-all duration-300 ${
              scorePercentage >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
              scorePercentage >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-pink-500'
            }`} 
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      )}
      
      <ActionConfirmation
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        headerMessage="Delete Quiz"
        bodyMessage="Are you sure you want to delete this quiz?"
        itemName={quiz.quiz_title}
        itemType="Quiz"
        action="delete"
      />
    </div>
  );
};

export default QuizCard;

