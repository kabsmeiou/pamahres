import { useParams, useLocation } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQuizApi } from "../../services/quizzes";
import TimeLimitBar from "../../components/TimeLimitBar";
import { Quiz, Question, QuizItemDetails } from "../../types/quiz";
import QuizItem from "./QuizItem";
import Skeleton from "@mui/material/Skeleton";
import { useQueryClient } from "@tanstack/react-query";
import ShowConfirmation from "../../components/ShowConfirmation";

const QuizPage = () => {
    const queryClient = useQueryClient();

    // quiz api and ids
    const { fetchQuestionsByQuizId, getQuizById, submitQuiz } = useQuizApi();
    const { courseId, quizId } = useParams();

    // quiz state
    const [hasStarted, setHasStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [numberOfQuestionsAnswered, setNumberOfQuestionsAnswered] = useState(0);
    const [isPaused, setIsPaused] = useState(true);
    const [hasSubmitted, setHasSubmitted] = useState(false);
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

    // get the quiz data from the previous state, if not present, fetch it
    let location = useLocation();
    const quizFromState = location.state as Quiz | null;

    const { data: quizFromFetch, isLoading: quizLoading, error: quizError } = useQuery<Quiz>({
        queryKey: ["quiz-info", quizId],
        queryFn: () => getQuizById(Number(quizId)),
        enabled: !quizFromState, // only fetch if not provided in state
        initialData: quizFromState || undefined, // use the state if available
    });

    const quiz = quizFromFetch || quizFromState;
    
    const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuery<Question[]>({
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

    const handleNextQuestion = () => {
        setCurrentQuestionIndex(Math.min(questions!.length - 1, currentQuestionIndex + 1));
    }

    const handlePreviousQuestion = () => {
        setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
    }

    const handleGoBack = () => {
        if (!hasSubmitted) {
            setShowConfirmation(true);
            setHeaderMessage("Are you sure you want to go back?");
            setBodyMessage("If you go back, you will lose your progress and the quiz will be marked as incomplete.");
        } else {
            // if the quiz has been submitted, go back to the quiz list without confirmation
            window.history.back();
        }           
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

    // if everything is still loading, show a loading screen
    if (quizLoading) {
        return <div className="flex items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
        </div>
    }

    return (
        <div className="min-h-[calc(100vh-9rem)] flex flex-col lg:flex-row gap-6 p-4 bg-gray-50">
            {/* pop up confirmation for going back to the quiz list which is currently hidden and opens if back is pressed */}
            {showConfirmation && !hasSubmitted && (
                <ShowConfirmation
                    courseId={Number(courseId)}
                    action="submit"
                    setShowConfirmation={setShowConfirmation}
                    headerMessage={headerMessage}
                    bodyMessage={bodyMessage}
                    handleSubmitItem={handleSubmitQuiz}
                    isSubmittingConfirmation={isSubmittingConfirmation}
                    setIsSubmittingConfirmation={setIsSubmittingConfirmation}
                />
            )}
            {/* Sidebar or quiz meta info */}
            <div className="lg:w-1/4 w-full bg-white rounded-xl shadow-md p-6 transition-all duration-300 h-fit sticky top-24">
                <div className="flex flex-col gap-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-800">{quiz?.quiz_title ?? 'Quiz Title'}</h1>
                    </div>
                    {showScore && (
                        <div className="text-center">
                            <p className="text-lg text-gray-600">
                                You scored <span className="font-bold text-primary-600">{result.filter(r => r.is_correct).length}</span> out of <span className="font-bold text-primary-600">{quiz?.number_of_questions ?? 0}</span>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Review your answers below</p>
                        </div>
                    )}
                    {/* time limit as progress bar */}
                    <div className="w-full rounded-lg overflow-hidden bg-gray-100 p-4">
                        <TimeLimitBar 
                            totalMinutes={Number(quiz?.time_limit_minutes ?? 10)}
                            isPaused={isPaused}
                        />
                    </div>
                    <div className="flex text-sm justify-between w-full px-2">
                        {/* number of questions remaining */}
                        {/* if questions are loading, show skeleton */}
                        {questionsLoading ? (
                            <Skeleton variant="text" width={100} height={20} />
                        ) : (
                            <p className="font-medium text-gray-700">
                                Questions Left: <span className="text-primary-600">{quiz?.number_of_questions ? quiz?.number_of_questions - numberOfQuestionsAnswered : 0}</span>
                            </p>
                        )}

                        {/* number of questions */}
                        <p className="font-medium text-gray-700">
                            Total Questions: <span className="text-primary-600">{quiz?.number_of_questions ?? 0}</span>
                        </p>
                    </div>
                </div>
                <div className="mt-6 mb-4">
                    <h2 className="text-sm font-semibold text-gray-600 mb-3">Question Navigator</h2>
                    <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 max-h-[calc(100vh-30rem)] overflow-y-auto pr-1">
                    {quiz?.current_number_of_questions && quiz?.current_number_of_questions > 0 && Array.isArray(questions) && questions.length > 0
                        ? questions!.map((question, index) => (
                            <button
                                onClick={() => setCurrentQuestionIndex(index)}
                                key={question.id}
                                aria-label={`Go to question: ${question.question}`}
                                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                                    index === currentQuestionIndex 
                                        ? 'bg-primary-600 text-white shadow-md' 
                                        : answers[Number(question.id)] 
                                            ? 'bg-primary-100 text-primary-800 hover:bg-primary-200' 
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))
                        : // Show 12 skeleton placeholders while loading
                        Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={`skeleton-${i}`}
                                className="aspect-square flex items-center justify-center bg-white rounded-lg"
                            >
                                <Skeleton variant="rectangular" width={30} height={30} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={handleGoBack}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        &larr; Back
                    </button>
                    {hasStarted ? (
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
                            disabled={hasSubmitted}
                        >
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={handleStartQuiz}
                            className="px-6 py-2 bg-primary-600 text-white font-medium rounded-lg shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
                        >
                            Start Quiz
                        </button>
                    )}
                </div>
            </div>

            {/* Question display */}
            {hasStarted ? (
            <div className="lg:w-3/4 w-full rounded-xl p-6">
                {isSubmitting ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">Checking your answers...</p>
                        </div>
                    </div>
                ) : questions && currentQuestionIndex < questions.length && (
                    <div className="flex flex-col h-full">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                                answers[Number(questions[currentQuestionIndex].id)] 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {answers[Number(questions[currentQuestionIndex].id)] 
                                    ? 'Answered' 
                                    : 'Not answered'}
                            </span>
                        </div>
                        
                        <div className="flex-grow mb-6">
                            <QuizItem 
                                question={questions[currentQuestionIndex]} 
                                numberOfQuestionsAnswered={numberOfQuestionsAnswered} 
                                setNumberOfQuestionsAnswered={setNumberOfQuestionsAnswered} 
                                answers={answers}
                                setAnswers={setAnswers}
                                result={result}
                                hasSubmitted={hasSubmitted}
                            />
                        </div>
                        
                        <div className="flex justify-between mt-auto pt-6 border-t border-gray-100">
                            <button
                                onClick={handlePreviousQuestion}
                                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                    currentQuestionIndex > 0 
                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={currentQuestionIndex === 0}
                            >
                                &larr; Previous
                            </button>
                            <button
                                onClick={handleNextQuestion}
                                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                                    currentQuestionIndex < questions.length - 1 
                                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={currentQuestionIndex === questions.length - 1}
                            >
                                Next &rarr;
                            </button>
                        </div>
                    </div>
                )}
            </div>
            ) : (
                <div className="lg:w-3/4 w-full rounded-xl p-6">
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-600 font-medium">Quiz not started yet</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default QuizPage