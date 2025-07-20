import { useEffect, useState } from 'react';
import { Upload, FileText, ArrowRight, ArrowLeft, RotateCcw } from 'react-feather';
import Pamahres from '../assets/pamahres.png';
import { useQuizApi } from '../services/quizzes';
import { useUserApi } from '../services/users';
import { Question, QuizResult } from '../types/quiz';
import supabase from '../lib/supabase';
import QuizItem from './QuizView/QuizItem';

import type { UserDetail } from '../types/user';

const QuickCreate = () => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [quizGenerated, setQuizGenerated] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
    const [numberOfQuestionsAnswered, setNumberOfQuestionsAnswered] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [quizData, setQuizData] = useState<{
        quiz_id: number;
        quiz_title: string;
        questions: Question[];
    } | null>(null);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [userDetails, setUserDetails] = useState<UserDetail | null>(null);

    const { quickCreateQuiz, checkQuickCreateStatus, submitQuiz, deleteQuiz } = useQuizApi();
    const { getUserDetails } = useUserApi();

    // get userdetails to fetch quick_create credit every time quiz is generated
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const userDetails = await getUserDetails();
                setUserDetails(userDetails as UserDetail);
            } catch (err) {
                console.error("Failed to fetch user details:", err);
            }
        };

        fetchUserDetails();
    }, [quizGenerated]);
    

    const validateFilename = (filename: string): string => {
        return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    };

    const uploadFileToSupabase = async (file: File): Promise<{ filePath: string; publicUrl: string }> => {
        const date = new Date().toISOString().split(".")[0];
        const fileName = file.name;
        const fileNameWithoutExtension = fileName.replace(/\.(pdf|doc|docx|txt)$/i, "");
        const filePath = `${date}_${validateFilename(fileNameWithoutExtension)}`;

        const { data, error } = await supabase.storage
            .from('materials-all')
            .upload(filePath, file);

        if (error) {
            console.error('Upload failed:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }

        if (!data) {
            throw new Error('Upload failed: No data returned');
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('materials-all')
            .getPublicUrl(filePath);

        return { filePath, publicUrl };
    };

    const handleFileUpload = async (file: File) => {
        setUploadedFile(file);
        setError(null);
        setIsGenerating(true);
        setIsUploading(true);
        setUploadProgress(0);

        const fileNameWithoutExtension = file.name.replace(/\.(pdf|doc|docx|txt)$/i, "");

        try {
            // Upload file to Supabase
            setUploadProgress(20);
            const { filePath } = await uploadFileToSupabase(file);
            setUploadProgress(50);
            
            const createResponse = await quickCreateQuiz({
                material_file_url: filePath,
                file_name: fileNameWithoutExtension,
                file_size: file.size,
                file_type: file.type || 'application/pdf',
                quiz_title: `Quiz from ${fileNameWithoutExtension}`,
                number_of_questions: 4,
                time_limit_minutes: 10
            });

            setUploadProgress(70);

            if (createResponse) {
                const quizId = createResponse.quiz_id;
                
                // Poll for quiz completion
                const pollQuizStatus = async () => {
                    const statusResponse = await checkQuickCreateStatus(quizId);
                    
                    if (statusResponse) {
                        if (statusResponse.status === 'completed' && statusResponse.questions) {
                            setQuizData({
                                quiz_id: quizId,
                                quiz_title: statusResponse.quiz_title,
                                questions: statusResponse.questions
                            });
                            setIsGenerating(false);
                            setQuizGenerated(true);
                            setUploadProgress(100);
                        } else if (statusResponse.status === 'generating') {
                            // Continue polling
                            setTimeout(pollQuizStatus, 2000);
                        }
                    }
                };

                pollQuizStatus();
            }
        } catch (err) {
            console.error("Error during upload process:", err);
            setError(err instanceof Error ? err.message : 'Failed to create quiz');
            setIsGenerating(false);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const nextQuestion = () => {
        if (quizData && currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!quizData) return;

        try {
            // Convert selectedAnswers to the format expected by the API
            const answers = quizData.questions.map((question, index) => ({
                question_id: question.id!,
                answer: selectedAnswers[question.id!] || '' // Use empty string if no answer selected
            }));

            const result = await submitQuiz(quizData.quiz_id, answers);

            if (result) {
                setQuizResult(result);
                setShowResults(true);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit quiz');
        }
    };

    const resetQuiz = () => {
        setUploadedFile(null);
        setQuizGenerated(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setNumberOfQuestionsAnswered(0);
        setShowResults(false);
        setIsGenerating(false);
        setQuizData(null);
        setQuizResult(null);
        setError(null);
        setUploadProgress(0);
        if (quizData) {
            deleteQuiz(quizData.quiz_id).catch(err => {
                console.error("Failed to delete quiz:", err);
            });
        }
    };

    const calculateScore = () => {
        console.log("Calculating score for quiz result:", quizResult?.score);
        return quizResult?.score || 0;
    };

    const currentQuestion = quizData?.questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-primary-200 to-primary-300 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg opacity-25 animate-bounce"></div>
            <div className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full opacity-30 animate-ping"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
                <img src={Pamahres} alt="Pamahres" className="w-8 h-8" />
                <span className="text-xl font-semibold text-primary-600">Pamahres</span>
                <span className="text-sm text-gray-500 ml-2">Quick Create Credits: {userDetails?.quick_create_credit}</span>
            </div>
            <button
                onClick={resetQuiz}
                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
                <RotateCcw className="w-4 h-4" />
                Start Over
            </button>
            </div>
        </header>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
            {/* Error Display */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="text-red-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                        <div className="ml-auto">
                            <button
                                onClick={() => setError(null)}
                                className="text-red-400 hover:text-red-600"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {!uploadedFile && (
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-gray-900 bg-clip-text text-transparent mb-4">
                Quick Create Quiz
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your study material and get an AI-generated quiz instantly. Perfect for quick study sessions!
                </p>
            </div>
            )}

            {/* Upload Section */}
            {!uploadedFile && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center transition-all hover:border-primary-400 hover:bg-primary-50">
                <div
                className={`transition-all ${isDragOver ? 'scale-105' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                >
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Upload Your Study Material</h3>
                <p className="text-gray-600 mb-6">
                    Drag and drop your PDF, Word document, or text file here
                </p>
                
                <label className="inline-block">
                    <input
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt"
                    />
                    <span className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-medium cursor-pointer inline-flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105">
                    Choose File
                    <FileText className="w-4 h-4" />
                    </span>
                </label>
                
                <p className="text-sm text-gray-500 mt-4">
                    Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                </p>
                </div>
            </div>
            )}

            {/* Generating Quiz */}
            {uploadedFile && isGenerating && (
            <div className="text-center">
                <div className="bg-white rounded-2xl border border-primary-200 p-12 shadow-lg">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
                    <FileText className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Generating Your Quiz</h3>
                <p className="text-gray-600 mb-4">
                    AI is analyzing "{uploadedFile.name}" and creating personalized questions...
                </p>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
                </div>
                
                <p className="text-sm text-gray-500">
                    {isUploading ? 'Uploading file...' : 'Generating questions... This usually takes 30-60 seconds'}
                </p>
                </div>
            </div>
            )}

            {/* Quiz Interface */}
            {quizGenerated && !showResults && (
            <div className="bg-white rounded-2xl border border-primary-200 shadow-lg overflow-hidden">
                {/* Quiz Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
                <h2 className="text-2xl font-bold mb-2">{quizData?.quiz_title}</h2>
                <div className="flex items-center justify-between">
                    <span>Question {currentQuestionIndex + 1} of {quizData?.questions.length}</span>
                    <span className="text-primary-200">From: {uploadedFile?.name}</span>
                </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 h-1">
                <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-1 transition-all duration-300"
                    style={{width: `${quizData ? ((currentQuestionIndex + 1) / quizData.questions.length) * 100 : 0}%`}}
                ></div>
                </div>

                {/* Question Content */}
                <div className="p-8">
                    {currentQuestion && (
                        <QuizItem
                            question={currentQuestion}
                            setNumberOfQuestionsAnswered={setNumberOfQuestionsAnswered}
                            answers={selectedAnswers}
                            setAnswers={setSelectedAnswers}
                            result={[]} // No results during quiz taking
                            hasSubmitted={false} // Not submitted yet
                            isReviewMode={isReviewMode} // Not in review mode
                        />
                    )}
                </div>

                {/* Navigation */}
                <div className="border-t border-gray-200 p-6 flex items-center justify-between">
                <button
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                </button>

                {currentQuestionIndex === (quizData?.questions.length || 0) - 1 ? (
                    <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length !== (quizData?.questions.length || 0)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    Submit Quiz
                    </button>
                ) : (
                    <button
                    onClick={nextQuestion}
                    className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-medium"
                    >
                    Next
                    <ArrowRight className="w-4 h-4" />
                    </button>
                )}
                </div>
            </div>
            )}

            {/* Results */}
            {showResults && (
            <div className="bg-white rounded-2xl border border-primary-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 text-center">
                <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
                <p className="text-green-100">Great job finishing the quiz</p>
                </div>

                <div className="p-8 text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl font-bold text-white">
                    {Math.round((calculateScore() / (quizData?.questions.length || 1)) * 100)}%
                    </span>
                </div>

                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    You scored {calculateScore()} out of {quizData?.questions.length || 0}
                </h3>
                
                <p className="text-gray-600 mb-8">
                    {calculateScore() === (quizData?.questions.length || 0)
                    ? "Perfect score! You have mastered this material."
                    : calculateScore() >= (quizData?.questions.length || 0) * 0.7
                    ? "Great job! You have a good understanding of the material."
                    : "Keep studying! Review the material and try again."
                    }
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                    onClick={() => setIsReviewMode(true)}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-medium"
                    >
                    Review Answers
                    </button>
                    <button
                    onClick={() => {
                        setShowResults(false);
                        setCurrentQuestionIndex(0);
                        setSelectedAnswers({});
                    }}
                    className="border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-600 hover:text-white transition-all font-medium"
                    >
                    Retake Quiz
                    </button>
                </div>
                </div>
            </div>
            )}
        </div>
        </div>
    );
};

export default QuickCreate;
