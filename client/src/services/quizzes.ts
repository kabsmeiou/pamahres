import { useApiClient } from "./api";
import { Quiz, Question, QuizResult } from "../types/quiz";
import { useState } from "react";

// TODO
// DO NOT REPEAT YOURSELF ok
// maybe useMemo for the api calls?

import callApi from "../lib/apiHelper";

export function useQuizApi() {
    const api = useApiClient();

    // State for loading and error handling
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getQuizzes = async (id: number | string) => {
        return callApi(() => api.get<Quiz[]>(`api-quiz/courses/${id}/quizzes/`), setLoading, setError);
    };

    const createQuiz = async (id: number | string, quiz: Quiz) => {
        return callApi(() => api.post<Quiz>(`api-quiz/courses/${id}/quizzes/`, quiz), setLoading, setError);
    };

    const deleteQuiz = async (id: number) => {
        return callApi(() => api.delete<Quiz>(`api-quiz/quizzes/${id}/delete/`), setLoading, setError);
    };

    const generateQuestions = async (id: number) => {
        return callApi(() => api.post<Quiz>(`api-quiz/quizzes/${id}/generate-questions/`), setLoading, setError);
    };

    const fetchQuestionsByQuizId = async (id: number) => {
        return callApi(() => api.get<Question[]>(`api-quiz/quizzes/${id}/questions/`), setLoading, setError);
    };

    const getQuizById = async (id: number) => {
        return callApi(() => api.get<Quiz>(`api-quiz/quizzes/${id}/`), setLoading, setError);
    };

    const submitQuiz = async (id: number, answers: any) => {
        return callApi(() => api.post<QuizResult>(`api-quiz/quizzes/${id}/check-answers/`, answers), setLoading, setError);
    };

    return { getQuizzes, createQuiz, generateQuestions, deleteQuiz, loading, error, fetchQuestionsByQuizId, getQuizById, submitQuiz };
}