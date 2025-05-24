import { Link } from "react-router-dom"
import { X } from "react-feather";

const ShowConfirmation = ({ courseId, setShowConfirmation, headerMessage, bodyMessage, handleSubmitQuiz, isSubmittingConfirmation, setIsSubmittingConfirmation }: { courseId: number, setShowConfirmation: (show: boolean) => void, headerMessage: string, bodyMessage: string, handleSubmitQuiz: () => void, isSubmittingConfirmation: boolean, setIsSubmittingConfirmation: (isSubmitting: boolean) => void }) => {

    const handleClose = () => {
        setShowConfirmation(false);
        setIsSubmittingConfirmation(false);
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-lg animate-fadeIn transition-all duration-300">
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                {headerMessage}
                </h3>
                <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
                aria-label="Close confirmation modal"
                >
                <X size={20} />
                </button>
            </div>
            <div>
                <p className="text-gray-600 px-6 py-4">
                    {bodyMessage}
                </p>
            </div>
            <div className="px-6 py-4 flex justify-end gap-2">
                <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                Cancel
                </button>
                {isSubmittingConfirmation ? (
                    <button
                    onClick={handleSubmitQuiz}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
                    >
                        Yes, submit
                    </button>
                ) : (   
                    <Link
                    to={`/courses/${courseId}/quizzes`}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
                    >
                        Yes, Go Back
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ShowConfirmation;