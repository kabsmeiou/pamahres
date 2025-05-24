import { useApiClient } from "./api";
import { Quiz, Question, QuizResult } from "../types/quiz";
import { useState } from "react";

// TODO
// DO NOT REPEAT YOURSELF ok
// maybe useMemo for the api calls?


export function useQuizApi() {
    const api = useApiClient();

    // State for loading and error handling
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // reusable function for api calls
    async function callApi<T>(apiCall: () => Promise<{data: T}>): Promise<T> {
        setLoading(true);
        setError(null);
        try {
            const response = await apiCall();
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            throw err;
        } finally {
            setLoading(false);
        }
    }

    const getQuizzes = async (id: number | string) => {
        return callApi(() => api.get<Quiz[]>(`api-quiz/courses/${id}/quizzes/`));
    };

    const createQuiz = async (id: number | string, quiz: Quiz) => {
        return callApi(() => api.post<Quiz>(`api-quiz/courses/${id}/quizzes/`, quiz));
    };

    const deleteQuiz = async (id: number) => {
        return callApi(() => api.delete<Quiz>(`api-quiz/quizzes/${id}/delete/`));
    };

    const generateQuestions = async (id: number) => {
        return callApi(() => api.post<Quiz>(`api-quiz/quizzes/${id}/generate-questions/`));
    };

    const fetchQuestionsByQuizId = async (id: number) => {
        return callApi(() => api.get<Question[]>(`api-quiz/quizzes/${id}/questions/`));
    };

    const getQuizById = async (id: number) => {
        return callApi(() => api.get<Quiz>(`api-quiz/quizzes/${id}/`));
    };

    const submitQuiz = async (id: number, answers: any) => {
        return callApi(() => api.post<QuizResult>(`api-quiz/quizzes/${id}/check-answers/`, answers));
    };

    return { getQuizzes, createQuiz, generateQuestions, deleteQuiz, loading, error, fetchQuestionsByQuizId, getQuizById, submitQuiz };
}