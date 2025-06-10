import { Clock, FileText, Loader, Trash2, Calendar, CheckCircle, AlertCircle } from "react-feather";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";

import { Quiz } from "../../types/quiz";
import { useQuizApi } from "../../services/quizzes";
import { useDeleteItem } from "../../hooks/useDeleteItem";

import Error from "../../components/Error";
import ActionConfirmation from "../../components/ActionConfirmation";

const QuizCard = ({quiz}: {quiz: Quiz}) => {
  const { deleteQuiz } = useQuizApi();
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = parseInt(courseId!, 10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clickedReview, setClickedReview] = useState(false);

  // wrapper function to delete quiz with courseId
  // This is necessary because the deleteQuiz function expects an id, but we need to pass courseId as well
  // This is a workaround to match the expected signature of useDeleteItem
  const deleteQuizWithCourse = async (courseId: number | string, id?: number) => {
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
  const scoreColor = scorePercentage >= 70 ? 'text-green-600' : scorePercentage >= 40 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div 
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {clickedReview && (
        <Error message="This feature is not available yet. Please check back later." />
      )}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-grow space-y-3">
            <Link 
              to={`/courses/${courseId}/quizzes/${quiz.id}`}
              state={quiz}
              className="group inline-flex items-start gap-3 hover:no-underline cursor-pointer"
            >
              <div className="p-2 bg-primary-50 text-primary-600 rounded-lg flex-shrink-0 mt-0.5 group-hover:bg-primary-100 transition-colors">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                  {quiz.quiz_title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock size={15} />
                    <span className="text-sm">{quiz.time_limit_minutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <AlertCircle size={15} />
                    {quiz.number_of_questions === 0 ? (
                      <span className="text-sm">No questions</span>
                    ) : (
                      <span className="text-sm">{quiz.number_of_questions} questions</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Last taken information */}
            <div className="flex items-center gap-1.5 text-gray-500 mt-3">
              <Calendar size={14} className="flex-shrink-0" />
              <span className="text-xs">{lastTaken}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 items-end">
            {/* Score display */}
            {quiz.quiz_score !== undefined && (
              <div className="flex items-center gap-2">
                <div className={`text-sm font-medium ${scoreColor}`}>
                  <span className="text-lg font-bold">{quiz.quiz_score}</span>
                  <span className="text-gray-600">/{quiz.number_of_questions}</span>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50">
                  <CheckCircle className={`${scoreColor}`} size={16} />
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                className={`inline-flex items-center justify-center gap-1.5 bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm ${quiz.number_of_questions === 0 ? "hidden" : ""}`}
                onClick={() => setClickedReview(true)}
              >
                <span className="text-white px-3 py-2">Review</span>
              </button>
              <Link
                to={`/courses/${courseId}/quizzes/${quiz.id}`}
                className="inline-flex items-center justify-center gap-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm cursor-pointer"
              >
                {quiz.last_taken === null ? (
                  <span className="px-3 py-2">Take Quiz</span>
                ) : (
                  <span className="px-3 py-2">Retake</span>
                )}
              </Link>
              {/* use dots menu to wrap the delete quiz button */}
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className={`p-2 rounded-lg transition-colors ${
                  isDeleting 
                    ? "text-gray-400 cursor-not-allowed" 
                    : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                }`}
                aria-label="Delete quiz"
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
      
      {quiz.quiz_score !== undefined && !isNaN(scorePercentage) && (
        <div className="w-full h-1.5 bg-gray-100">
          <div 
            className={`h-full ${
              scorePercentage >= 70 ? 'bg-green-500' : 
              scorePercentage >= 40 ? 'bg-yellow-500' : 
              'bg-red-500'
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

