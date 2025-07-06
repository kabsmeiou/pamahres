import { useState, useContext, useEffect } from "react";
import { X, Loader } from "react-feather";
import { useParams } from "react-router-dom";
import { useQuizApi } from "../../services/quizzes";
import { useQueryClient } from "@tanstack/react-query";
import { Material } from "../../types/course";
import { Quiz } from "../../types/quiz";
import { MaterialsContext } from "../../components/CourseLayout";

interface MaterialQuiz {
  materialId: number;
  file_name: string;
}

interface QuizFormProps {
  isOpen: boolean;
  onClose: () => void;
  materialQuiz?: MaterialQuiz // optional prop for quiz creation from material
}

const QuizForm = ({ isOpen, onClose, materialQuiz }: QuizFormProps) => {
  // param extraction for course id
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = parseInt(courseId!, 10);

  // for API calls
  const queryClient = useQueryClient();

  const { createQuiz, generateQuestions } = useQuizApi();

  // quiz form data
  const [formData, setFormData] = useState<Quiz>({
    quiz_title: "",
    time_limit_minutes: 10,
    material_list: [],
    number_of_questions: 0
  });

  // quiz form state
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [createQuizLoading, setCreateQuizLoading] = useState(false);

  // if materialQuiz is provided, set initial state based on it
  // this is used when creating a quiz directly from a material
  // it will pre-fill the quiz title and material list
  useEffect(() => {
    if (materialQuiz && materialQuiz.materialId !== undefined) {
      setSelectedMaterialId(String(materialQuiz.materialId));
      setFormData(prev => ({
        ...prev,
        quiz_title: `Quiz for ${materialQuiz.file_name || 'Material'}`,
        material_list: [materialQuiz.materialId],
        number_of_questions: 10 // reset to 10 as default
      }));
    }
  }, [materialQuiz]);

  // material context for sidebar
  const context = useContext(MaterialsContext)
  if (!context) throw new Error("MaterialsContext not found")
  const { materials, materialsLoading } = context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateQuizLoading(true);
    try {
      const quizData: Quiz = {
        ...formData,
        material_list: selectedMaterialId ? [parseInt(selectedMaterialId, 10)] : [],
        number_of_questions: selectedMaterialId ? formData.number_of_questions : 0
      };
      const quiz = await createQuiz(numericCourseId, quizData);
      if (quiz.material_list && quiz.material_list.length > 0) {
        try {
          await generateQuestions(quiz.id!);
        } catch (err: any) {
          console.error("Error generating questions:", err);
        }
      }
      console.log("Quiz created, number of questions:", quiz.number_of_questions)

      if (quiz.current_number_of_questions === 0) {
        // call an async function to check the status of the quiz every 5 seconds until
        // the quiz has questions
        console.log("Quiz created, setting isGeneratingQuestions to true");
        // logic here to handle the loading state of the quiz form
        // setIsGeneratingQuestions(true);
        // setCurrentQuizId(quiz.id!);
      }

      // Invalidate and refetch quizzes
      await queryClient.invalidateQueries({
        queryKey: ["quizzes", numericCourseId]
      });
      onClose();
    } catch (err: any) {
      console.error("Error creating quiz:", err);
    } finally {
      setCreateQuizLoading(false);

      // Reset form state
      setSelectedMaterialId("");
      setFormData({
        quiz_title: "",
        time_limit_minutes: 10,
        material_list: [],
        number_of_questions: 0
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Quiz</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate questions from your materials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quiz Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              required
              value={formData.quiz_title}
              onChange={(e) => setFormData(prev => ({ ...prev, quiz_title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
              placeholder="Enter quiz title..."
            />
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Time Limit
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                value={formData.time_limit_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, time_limit_minutes: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 pr-20 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                minutes
              </span>
            </div>
          </div>

          {/* Material Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Course Material
            </label>
            {materialsLoading ? (
              <div className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full animate-spin"></div>
                Loading materials...
              </div>
            ) : (
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
              >
                <option value="">Select a material (optional)</option>
                {materials?.map((material: Material) => (
                  <option key={material.id} value={material.id}>
                    {material.file_name}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Choose a material to auto-generate questions, or leave empty for manual questions
            </p>
          </div>

          {/* Number of Questions */}
          {selectedMaterialId && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                required
                min="1"
                max="20"
                value={formData.number_of_questions}
                onChange={(e) => setFormData(prev => ({ ...prev, number_of_questions: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Maximum 20 questions per quiz
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createQuizLoading}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createQuizLoading}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createQuizLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Quiz</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizForm;