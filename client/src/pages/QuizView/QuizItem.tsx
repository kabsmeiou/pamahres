import { useEffect } from "react";
import { Question, QuizItemDetails } from "../../types/quiz";

interface QuizItemProps {
    question: Question;
    setNumberOfQuestionsAnswered: React.Dispatch<React.SetStateAction<number>>;
    answers: Record<number, string>;
    setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    result: QuizItemDetails[];
    hasSubmitted: boolean;
    isReviewMode?: boolean;
}

const QuizItem = ({
    question,
    setNumberOfQuestionsAnswered,
    answers,
    setAnswers,
    result,
    hasSubmitted,
    isReviewMode = false
}: QuizItemProps) => {
    useEffect(() => {
        // In review mode, populate answers from user_answer
        if (isReviewMode && question.user_answer && question.id) {
            setAnswers(prev => ({ ...prev, [Number(question.id)]: question.user_answer! }));
        }
    }, [question.id, isReviewMode, question.user_answer, setAnswers]);

    const handleChange = (value: string) => {
        // Disabled in review mode
        if (isReviewMode) return;
        
        // if question did not have an answer, increment the number of questions answered
        const wasAnswered = answers.hasOwnProperty(Number(question.id));
        if (!wasAnswered) {
            setNumberOfQuestionsAnswered(prev => prev + 1);
        }
        setAnswers(prev => ({ ...prev, [Number(question.id)]: value }));
    };

    // Find the result for this question if available
    const questionResult = result.length > 0 ? result.find(r => r.question_id === question.id) : null;
    
    // Get the current answer (either from answers state or user_answer in review mode)
    const currentAnswer = isReviewMode ? question.user_answer : answers[Number(question.id)];

    return (
        <div className="space-y-6">
            {/* Question */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">{question.question}</h2>
                
                {/* Review Mode: Show User Answer and Correct Answer */}
                {isReviewMode && question.user_answer && question.correct_answer && (
                    <div className="mt-4 space-y-3">
                        {/* User's Answer */}
                        <div className={`flex items-start gap-3 p-4 rounded-xl ${
                            question.user_answer === question.correct_answer
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50'
                                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50'
                        }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                question.user_answer === question.correct_answer 
                                    ? 'bg-green-100 dark:bg-green-800' 
                                    : 'bg-red-100 dark:bg-red-800'
                            }`}>
                                {question.user_answer === question.correct_answer ? (
                                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className={`font-medium ${
                                    question.user_answer === question.correct_answer 
                                        ? 'text-green-800 dark:text-green-300' 
                                        : 'text-red-800 dark:text-red-300'
                                }`}>
                                    Your Answer: {question.user_answer}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {question.user_answer === question.correct_answer ? 'Correct!' : 'Incorrect'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Correct Answer (always show in review mode) */}
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-800">
                                <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-medium text-blue-800 dark:text-blue-300">
                                    Correct Answer: {question.correct_answer}
                                </p>
                                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                    This is the right answer for this question
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                {questionResult && (
                    <div className={`mt-4 flex items-start gap-3 p-4 rounded-xl ${
                        questionResult.is_correct 
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50' 
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50'
                    }`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            questionResult.is_correct ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'
                        }`}>
                            {questionResult.is_correct ? (
                                <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <p className={`font-medium ${questionResult.is_correct ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                {questionResult.is_correct ? 'Correct Answer!' : 'Incorrect Answer'}
                            </p>
                            {!questionResult.is_correct && questionResult.correct_answer && (
                                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                    Correct answer: <span className="font-medium">{questionResult.correct_answer}</span>
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Answer Options */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Select your answer:</h3>
                <div className="space-y-3">
                    {question.question_type === "MCQ" ? (
                        question.options.map((option, idx) => {
                            const optionLetter = String.fromCharCode(97 + idx); // "a", "b", "c", ...
                            const isSelected = currentAnswer === optionLetter;
                            const isCorrect = isReviewMode && question.correct_answer === optionLetter;
                            
                            return (
                                <label 
                                    key={option.id}
                                    htmlFor={`question-${question.id}-option${idx}`}
                                    className={`group flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                                        isCorrect && isReviewMode
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm'
                                            : isSelected 
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    } ${hasSubmitted || isReviewMode ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            isCorrect && isReviewMode
                                                ? 'border-green-500 bg-green-500'
                                                : isSelected 
                                                    ? 'border-blue-500 bg-blue-500' 
                                                    : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                                        }`}>
                                            {(isSelected || (isCorrect && isReviewMode)) && (
                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold text-sm ${
                                                isCorrect && isReviewMode
                                                    ? 'text-green-700 dark:text-green-300'
                                                    : isSelected 
                                                        ? 'text-blue-700 dark:text-blue-300' 
                                                        : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {optionLetter.toUpperCase()}.
                                            </span>
                                            <span className={`font-medium ${
                                                isCorrect && isReviewMode
                                                    ? 'text-green-900 dark:text-green-100'
                                                    : isSelected 
                                                        ? 'text-blue-900 dark:text-blue-100' 
                                                        : 'text-gray-900 dark:text-gray-100'
                                            }`}>
                                                {option.text}
                                            </span>
                                            {isCorrect && isReviewMode && (
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400">
                                                    Correct
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        id={`question-${question.id}-option${idx}`}
                                        checked={isSelected}
                                        onChange={() => handleChange(optionLetter)}
                                        className="sr-only"
                                        disabled={hasSubmitted || isReviewMode}
                                    />
                                </label>
                            );
                        })
                    ) : (
                        <>
                            {/* True Option */}
                            <label 
                                htmlFor={`question-${question.id}-option-true`}
                                className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                                    isReviewMode && question.correct_answer === "true"
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm'
                                        : currentAnswer === "true" 
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                } ${hasSubmitted || isReviewMode ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isReviewMode && question.correct_answer === "true"
                                        ? 'border-green-500 bg-green-500'
                                        : currentAnswer === "true" 
                                            ? 'border-blue-500 bg-blue-500' 
                                            : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                                }`}>
                                    {(currentAnswer === "true" || (isReviewMode && question.correct_answer === "true")) && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className={`font-medium ${
                                    isReviewMode && question.correct_answer === "true"
                                        ? 'text-green-900 dark:text-green-100'
                                        : currentAnswer === "true" 
                                            ? 'text-blue-900 dark:text-blue-100' 
                                            : 'text-gray-900 dark:text-gray-100'
                                }`}>
                                    True
                                </span>
                                {isReviewMode && question.correct_answer === "true" && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400">
                                        Correct
                                    </span>
                                )}
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    id={`question-${question.id}-option-true`}
                                    checked={currentAnswer === "true"}
                                    onChange={() => handleChange("true")}
                                    className="sr-only"
                                    disabled={hasSubmitted || isReviewMode}
                                />
                            </label>
                            
                            {/* False Option */}
                            <label 
                                htmlFor={`question-${question.id}-option-false`}
                                className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                                    isReviewMode && question.correct_answer === "false"
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm'
                                        : currentAnswer === "false" 
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                } ${hasSubmitted || isReviewMode ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isReviewMode && question.correct_answer === "false"
                                        ? 'border-green-500 bg-green-500'
                                        : currentAnswer === "false" 
                                            ? 'border-blue-500 bg-blue-500' 
                                            : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                                }`}>
                                    {(currentAnswer === "false" || (isReviewMode && question.correct_answer === "false")) && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className={`font-medium ${
                                    isReviewMode && question.correct_answer === "false"
                                        ? 'text-green-900 dark:text-green-100'
                                        : currentAnswer === "false" 
                                            ? 'text-blue-900 dark:text-blue-100' 
                                            : 'text-gray-900 dark:text-gray-100'
                                }`}>
                                    False
                                </span>
                                {isReviewMode && question.correct_answer === "false" && (
                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400">
                                        Correct
                                    </span>
                                )}
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    id={`question-${question.id}-option-false`}
                                    checked={currentAnswer === "false"}
                                    onChange={() => handleChange("false")}
                                    className="sr-only"
                                    disabled={hasSubmitted || isReviewMode}
                                />
                            </label>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizItem;
