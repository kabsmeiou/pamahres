import { useParams, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQuizApi } from "../../services/quizzes";
import TimeLimitBar from "../../components/TimeLimitBar";
import { Quiz, Question, QuizItemDetails } from "../../types/quiz";
import QuizItem from "./QuizItem";
import { useQueryClient } from "@tanstack/react-query";
import ActionConfirmation from "../../components/ActionConfirmation";
import { MaterialsContext } from "../../components/CourseLayout"

const QuizPage = () => {
    const context = useContext(MaterialsContext);
    const setShowNavigation = context?.setShowNavigation;

    const queryClient = useQueryClient();

    // quiz api and ids
    const { fetchQuestionsByQuizId, getQuizById, submitQuiz } = useQuizApi();
    const { courseId, quizId } = useParams();

    // get the quiz data from the previous state, if not present, fetch it
    let location = useLocation();
    const quizFromState = location.state as Quiz | null;
    
    // Check if we're in review mode
    const urlParams = new URLSearchParams(location.search);
    const isReviewMode = urlParams.get('mode') === 'review';

    // quiz state
    const [hasStarted, setHasStarted] = useState(isReviewMode); // auto-start in review mode
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [numberOfQuestionsAnswered, setNumberOfQuestionsAnswered] = useState(0);
    const [isPaused, setIsPaused] = useState(!isReviewMode); // don't pause in review mode
    const [hasSubmitted, setHasSubmitted] = useState(isReviewMode); // already submitted in review mode
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // quiz result
    const [result, setResult] = useState<QuizItemDetails[]>([]);
    const [showScore, setShowScore] = useState(false);

    // confirmation for going back to the quiz list
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [headerMessage, setHeaderMessage] = useState("Are you sure you want to go back?");
    const [bodyMessage, setBodyMessage] = useState("If you go back, you will lose your progress and the quiz will be marked as incomplete.");
    const [isSubmittingConfirmation, setIsSubmittingConfirmation] = useState(false);

    // save the answers to the quiz
    const [answers, setAnswers] = useState<Record<number, string>>({});

    const { data: quizFromFetch } = useQuery<Quiz>({
        queryKey: ["quiz-info", quizId],
        queryFn: () => getQuizById(Number(quizId)),
        enabled: !quizFromState, // only fetch if not provided in state
        initialData: quizFromState || undefined, // use the state if available
    });

    const quiz = quizFromFetch || quizFromState;
    
    const { data: questions, isLoading: questionsLoading } = useQuery<Question[]>({
        queryKey: ["quiz-questions", quizId],
        queryFn: () => fetchQuestionsByQuizId(Number(quizId)),
    });

    const validateAnswers = () => {
        const formattedAnswers = Object.entries(answers).map(([question_id, answer]) => ({
            question_id: Number(question_id),
            answer: answer,
        }));
        if (formattedAnswers.length === 0 || formattedAnswers.length !== questions?.length) {
            // fill the missing answers with empty strings
            for (let i = 0; i < (questions?.length ?? 0); i++) {
                // Bum ahh code needs to be to be assured like a sorry ahh b with !!!!!!!!!! here dam
                if (!formattedAnswers.find(answer => answer.question_id === questions![i].id)) {
                    formattedAnswers.push({ question_id: questions![i].id!, answer: '' });
                }
            }
        }
        return formattedAnswers;
    }

    const handleSubmitQuiz = async () => {
        setShowConfirmation(false);
        setIsSubmitting(true);
        setIsPaused(true);
        setHasSubmitted(true);
        const formattedAnswers = validateAnswers();
        // submit for checking
        try {
            const response = await submitQuiz(Number(quizId), formattedAnswers);
            setResult(response.results);
            queryClient.invalidateQueries({ queryKey: ["quizzes", courseId] });
        } catch (error) {
            console.error(error);
        } finally {
            setShowScore(true);
            setIsSubmitting(false);
            setIsSubmittingConfirmation(false);
        }
    }

    const handleConfirmGoBack = () => {
        if (setShowNavigation) {
            console.log("Setting show navigation to true");
            setShowNavigation(true);
        }
        window.history.back();
    }

    useEffect(() => {
        if (setShowNavigation) {
            setShowNavigation(false);
        }
    }, []);

    useEffect(() => {
        // scroll down the screen if necessary (if questions get lengthy and exceeds height)
        const quizContainer = document.querySelector('.quiz-item');
        if (quizContainer) {
            quizContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentQuestionIndex, questions, hasStarted]);

    const handleNextQuestion = () => {
        setCurrentQuestionIndex(Math.min(questions!.length - 1, currentQuestionIndex + 1));
    }

    const handlePreviousQuestion = () => {
        setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
    }

    const handleGoBack = () => {
        if (isReviewMode || hasSubmitted) {
            handleConfirmGoBack();
            return;
        }
        setShowConfirmation(true);
        setHeaderMessage("Are you sure you want to go back?");
        setBodyMessage("If you go back, you will lose your progress and the quiz will be marked as incomplete.");         
    }

    const handleSubmit = () => {
        setIsSubmittingConfirmation(true);
        setHeaderMessage("Are you sure you want to submit the quiz?");
        setBodyMessage("Review your answers before submitting.");
        setShowConfirmation(true);
    }

    const handleStartQuiz = () => {
        setHasStarted(true);
        setIsPaused(false);
    }

    const handleAction = () => {
        if (isSubmittingConfirmation) {
            return handleSubmitQuiz();
        } else {
            return handleConfirmGoBack();
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-surface-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
            {/* Confirmation Modal */}
            {showConfirmation && !hasSubmitted && (
                <ActionConfirmation
                    headerMessage={headerMessage}
                    bodyMessage={bodyMessage}
                    show={showConfirmation}
                    onConfirm={handleAction}
                    onClose={() => setShowConfirmation(false)}
                    isLoading={false}
                />
            )}
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Quiz Information */}
                    <div className="lg:w-80 w-full">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-8">
                            <div className="space-y-6">
                                {/* Quiz Title */}
                                <div className="text-center space-y-3">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {quiz?.quiz_title ?? 'Quiz Title'}
                                        {isReviewMode && (
                                            <span className="block text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
                                                Review Mode
                                            </span>
                                        )}
                                    </h1>
                                    
                                    {showScore && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Quiz Complete!</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {result.filter(r => r.is_correct).length}/{quiz?.number_of_questions ?? 0}
                                            </p>
                                            <p className="text-xs text-gray-600 dark:text-gray-300">Review your answers below</p>
                                        </div>
                                    )}
                                </div>

                                {/* Timer - Hidden in review mode */}
                                {!isReviewMode && (
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">Time Limit</span>
                                            <span className="text-sm text-orange-600 dark:text-orange-400">{quiz?.time_limit_minutes ?? 10} min</span>
                                        </div>
                                        <TimeLimitBar 
                                            totalMinutes={Number(quiz?.time_limit_minutes ?? 10)}
                                            isPaused={isPaused}
                                        />
                                    </div>
                                )}

                                {/* Progress Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Answered</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{isReviewMode ? quiz?.number_of_questions : numberOfQuestionsAnswered}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Total</p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{quiz?.number_of_questions ?? 0}</p>
                                    </div>
                                </div>

                                {/* Question Navigator */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Question Navigator</h3>
                                    <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
                                        {quiz?.current_number_of_questions && quiz?.current_number_of_questions > 0 && Array.isArray(questions) && questions.length > 0
                                            ? questions!.map((question, index) => (
                                                <button
                                                    onClick={() => setCurrentQuestionIndex(index)}
                                                    key={question.id}
                                                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        index === currentQuestionIndex 
                                                            ? 'bg-blue-600 text-white shadow-md' 
                                                            : (isReviewMode ? question.user_answer : answers[Number(question.id)])
                                                                ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/70' 
                                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))
                                            : Array.from({ length: 12 }).map((_, i) => (
                                                <div key={`skeleton-${i}`} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                                            ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={handleGoBack}
                                        className="w-full px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 font-medium rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        ← Back to Quizzes
                                    </button>
                                    
                                    {/* Hide submit/start buttons in review mode */}
                                    {!isReviewMode && (
                                        hasStarted ? (
                                            <button
                                                onClick={handleSubmit}
                                                className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                                                disabled={hasSubmitted}
                                            >
                                                Submit Quiz
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleStartQuiz}
                                                className="w-full px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                                                disabled={questionsLoading}
                                            >
                                                Start Quiz
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {hasStarted ? (
                            <div className="quiz-item bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center h-96 p-8">
                                        <div className="text-center">
                                            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-700 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Checking your answers</h3>
                                            <p className="text-gray-600 dark:text-gray-400">Please wait while we review your responses...</p>
                                        </div>
                                    </div>
                                ) : questions && currentQuestionIndex < questions.length && (
                                    <div className="p-6 md:p-8">
                                        {/* Question Header */}
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                    Question {currentQuestionIndex + 1} of {questions.length}
                                                </span>
                                                <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                                                    (isReviewMode ? questions[currentQuestionIndex].user_answer : answers[Number(questions[currentQuestionIndex].id)])
                                                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400' 
                                                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                                }`}>
                                                    {(isReviewMode ? questions[currentQuestionIndex].user_answer : answers[Number(questions[currentQuestionIndex].id)])
                                                        ? 'Answered' 
                                                        : 'Not answered'}
                                                </span>
                                                
                                            </div>
                                        </div>

                                        {/* Question Content */}
                                        <div className="mb-8">
                                            <QuizItem 
                                                question={questions[currentQuestionIndex]} 
                                                setNumberOfQuestionsAnswered={setNumberOfQuestionsAnswered} 
                                                answers={answers}
                                                setAnswers={setAnswers}
                                                result={result}
                                                hasSubmitted={hasSubmitted}
                                                isReviewMode={isReviewMode}
                                            />
                                        </div>

                                        {/* Navigation Buttons */}
                                        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={handlePreviousQuestion}
                                                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                                                    currentQuestionIndex > 0 
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600' 
                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                }`}
                                                disabled={currentQuestionIndex === 0}
                                            >
                                                ← Previous
                                            </button>
                                            <button
                                                onClick={handleNextQuestion}
                                                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                                                    currentQuestionIndex < questions.length - 1 
                                                    ? 'bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 shadow-sm hover:shadow-md' 
                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                }`}
                                                disabled={currentQuestionIndex === questions.length - 1}
                                            >
                                                Next →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ready to start?</h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">Click "Start Quiz" to begin your assessment.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QuizPage