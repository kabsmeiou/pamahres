import { Plus, FileText } from "react-feather";
import { useState } from "react";
import QuizForm from "./QuizForm";

const QuizHeader = () => {
  const [showQuizForm, setShowQuizForm] = useState(false);

  return (
    <div className="space-y-4">
      {/* Create Quiz Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">Generate quizzes from your course materials</span>
        </div>
        
        <button 
          className="inline-flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          onClick={() => setShowQuizForm(true)}
        >
          <Plus size={16} className="flex-shrink-0" />
          <span>Create Quiz</span>
        </button>
      </div>

      <QuizForm 
        isOpen={showQuizForm}
        onClose={() => setShowQuizForm(false)}
      />
    </div>
  );
};

export default QuizHeader;