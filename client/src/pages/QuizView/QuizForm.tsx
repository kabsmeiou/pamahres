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
    if (materialQuiz) {
      setSelectedMaterialId(materialQuiz.materialId.toString());
      setFormData(prev => ({
        ...prev,
        quiz_title: `Quiz for ${materialQuiz.file_name}`,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-surface-900">Create New Quiz</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-100 rounded-lg text-surface-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              required
              value={formData.quiz_title}
              onChange={(e) => setFormData(prev => ({ ...prev, quiz_title: e.target.value }))}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter quiz title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.time_limit_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, time_limit_minutes: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Select Material (Optional)
            </label>
            {materialsLoading ? (
              <div className="w-full px-3 py-2 border border-surface-200 rounded-lg bg-gray-100 text-surface-500">
                Loading materials...
              </div>
            ) : (
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">No material (manual questions)</option>
                {materials?.map((material: Material) => (
                  <option key={material.id} value={material.id}>
                    {material.file_name}
                  </option>
                ))}
              </select>
            )}
          </div>


          {selectedMaterialId && (
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">
                Number of Questions
              </label>
              <input
                type="number"
                required
                min="1"
                max="20"
                value={formData.number_of_questions}
                onChange={(e) => setFormData(prev => ({ ...prev, number_of_questions: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-sm text-surface-500">Maximum 20 questions</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={createQuizLoading}
              className="px-4 py-2 rounded-xl border border-surface-200 text-surface-700 hover:bg-surface-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createQuizLoading}
              className="px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              {createQuizLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
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