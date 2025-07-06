import { useEffect, useState } from "react";
import { Question, QuizItemDetails } from "../../types/quiz";

interface QuizItemProps {
    question: Question;
    setNumberOfQuestionsAnswered: React.Dispatch<React.SetStateAction<number>>;
    answers: Record<number, string>;
    setAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    result: QuizItemDetails[];
    hasSubmitted: boolean;
}

const QuizItem = ({
    question,
    setNumberOfQuestionsAnswered,
    answers,
    setAnswers,
    result,
    hasSubmitted
}: QuizItemProps) => {
    const [selectedOption, setSelectedOption] = useState<string>("");
    
    useEffect(() => {
        // Reset the selected option when a new question is shown
        setSelectedOption("");
    }, [question.id]);

    const handleChange = (value: string) => {
        // if question did not have an answer, increment the number of questions answered
        const wasAnswered = answers.hasOwnProperty(Number(question.id));
        if (!wasAnswered) {
            setNumberOfQuestionsAnswered(prev => prev + 1);
        }
        setSelectedOption(value);
        setAnswers(prev => ({ ...prev, [Number(question.id)]: value }));
    };

    // Find the result for this question if available
    const questionResult = result.length > 0 ? result.find(r => r.question_id === question.id) : null;

    return (
        <div className="space-y-6">
            {/* Question */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">{question.question}</h2>
                
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
                            const isSelected = answers[Number(question.id)] === optionLetter;
                            
                            return (
                                <label 
                                    key={option.id}
                                    htmlFor={`question-${question.id}-option${idx}`}
                                    className={`group flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                        isSelected 
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                    } ${hasSubmitted ? 'cursor-not-allowed opacity-75' : ''}`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            isSelected 
                                                ? 'border-blue-500 bg-blue-500' 
                                                : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                                        }`}>
                                            {isSelected && (
                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {optionLetter.toUpperCase()}.
                                            </span>
                                            <span className={`${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'} font-medium`}>
                                                {option.text}
                                            </span>
                                        </div>
                                    </div>
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        id={`question-${question.id}-option${idx}`}
                                        checked={isSelected}
                                        onChange={() => handleChange(optionLetter)}
                                        className="sr-only"
                                        disabled={hasSubmitted}
                                    />
                                </label>
                            );
                        })
                    ) : (
                        <>
                            <label 
                                htmlFor={`question-${question.id}-option-true`}
                                className={`group flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                    answers[Number(question.id)] === "true" 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                } ${hasSubmitted ? 'cursor-not-allowed opacity-75' : ''}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    answers[Number(question.id)] === "true" 
                                        ? 'border-blue-500 bg-blue-500' 
                                        : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                                }`}>
                                    {answers[Number(question.id)] === "true" && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className={`font-medium ${answers[Number(question.id)] === "true" ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                    True
                                </span>
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    id={`question-${question.id}-option-true`}
                                    checked={answers[Number(question.id)] === "true"}
                                    onChange={() => handleChange("true")}
                                    className="sr-only"
                                    disabled={hasSubmitted}
                                />
                            </label>
                            
                            <label 
                                htmlFor={`question-${question.id}-option-false`}
                                className={`group flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                    answers[Number(question.id)] === "false" 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                } ${hasSubmitted ? 'cursor-not-allowed opacity-75' : ''}`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    answers[Number(question.id)] === "false" 
                                        ? 'border-blue-500 bg-blue-500' 
                                        : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                                }`}>
                                    {answers[Number(question.id)] === "false" && (
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                </div>
                                <span className={`font-medium ${answers[Number(question.id)] === "false" ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                    False
                                </span>
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    id={`question-${question.id}-option-false`}
                                    checked={answers[Number(question.id)] === "false"}
                                    onChange={() => handleChange("false")}
                                    className="sr-only"
                                    disabled={hasSubmitted}
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
